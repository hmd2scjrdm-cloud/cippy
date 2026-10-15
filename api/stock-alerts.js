import nodemailer from "nodemailer";
import { getSiteConfig } from "./_lib/site-config.js";
import { backInStockEmail } from "./_lib/back-in-stock-email.js";
import { isAdminUser } from "./_lib/admin-auth.js";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;
const MAX_PENDING_PER_EMAIL = 10;

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
}

const sb = (path, serviceKey, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(opts.headers || {}) },
  });

// Is the (colour, size) the customer waits for in stock now? Colourless / plain-size products fall back to total stock.
function inStockNow(product, color, size) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  if (sizes.some((s) => s && typeof s === "object" && "color" in s)) {
    const entry = sizes.find((s) => (s.color || "") === color && s.size === size);
    return Boolean(entry && Number(entry.stock || 0) > 0);
  }
  return Number(product.stock || 0) > 0;
}

async function subscribe(body, serviceKey, res) {
  const { productId, color = "", size = "", email } = body;
  const addr = String(email || "").trim().toLowerCase();
  if (!UUID_RE.test(String(productId || "")) || !EMAIL_RE.test(addr) || addr.length > 200) return res.status(400).json({ error: "请填写有效的邮箱" });
  const pr = await sb(`products?id=eq.${productId}&select=id,in_stock`, serviceKey);
  const [product] = pr.ok ? await pr.json() : [];
  if (!product || product.in_stock === false) return res.status(404).json({ error: "商品不存在" });

  const pending = await sb(`stock_alerts?email=eq.${encodeURIComponent(addr)}&notified_at=is.null&select=id`, serviceKey);
  if (pending.ok && (await pending.json()).length >= MAX_PENDING_PER_EMAIL) return res.status(429).json({ error: "提醒数量已达上限" });

  // merge-duplicates + notified_at null: signing up again after an alert re-arms it.
  const r = await sb("stock_alerts?on_conflict=product_id,color,size,email", serviceKey, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ product_id: productId, color: String(color).slice(0, 80), size: String(size).slice(0, 40), email: addr, notified_at: null }),
  });
  if (!r.ok) {
    console.error("stock alert insert failed:", r.status, await r.text().catch(() => ""));
    return res.status(500).json({ error: "保存失败，请稍后再试" });
  }
  return res.status(200).json({ ok: true });
}

const WANTED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Other"];
const MAX_SIZE_REQUESTS_PER_EMAIL = 5;

// A customer tells us which (bigger) size they would buy; the admin sees the demand under 客户.
async function sizeRequest(body, serviceKey, res) {
  const addr = String(body.email || "").trim().toLowerCase();
  const wanted = String(body.wantedSize || "").trim();
  if (!EMAIL_RE.test(addr) || addr.length > 200) return res.status(400).json({ error: "请填写有效的邮箱" });
  if (!WANTED_SIZES.includes(wanted)) return res.status(400).json({ error: "请选择想要的尺码" });
  const num = (v, lo, hi) => { const n = parseFloat(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
  const productId = UUID_RE.test(String(body.productId || "")) ? body.productId : null;

  const existing = await sb(`size_requests?email=eq.${encodeURIComponent(addr)}&select=id`, serviceKey);
  if (existing.ok && (await existing.json()).length >= MAX_SIZE_REQUESTS_PER_EMAIL) return res.status(429).json({ error: "你已经提交过几次了，我们已记录" });

  const r = await sb("size_requests", serviceKey, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ email: addr, wanted_size: wanted, height_cm: num(body.heightCm, 100, 230), weight_kg: num(body.weightKg, 25, 250), product_id: productId }),
  });
  if (!r.ok) {
    console.error("size request insert failed:", r.status, await r.text().catch(() => ""));
    return res.status(500).json({ error: "保存失败，请稍后再试" });
  }
  return res.status(200).json({ ok: true });
}

async function notify(body, serviceKey, res) {
  const ids = [...new Set((Array.isArray(body.productIds) ? body.productIds : []).filter((id) => UUID_RE.test(String(id))))];
  if (!ids.length) return res.status(200).json({ sent: 0, customers: 0 });
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return res.status(500).json({ error: "邮件服务未配置" });

  const list = ids.join(",");
  const [pr, ar] = await Promise.all([
    sb(`products?id=in.(${list})&select=id,name,name_zh,image_url,stock,sizes,in_stock`, serviceKey),
    sb(`stock_alerts?product_id=in.(${list})&notified_at=is.null&select=*`, serviceKey),
  ]);
  const products = pr.ok ? await pr.json() : [];
  const alerts = ar.ok ? await ar.json() : [];
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  // group the alerts that are now satisfiable by customer email
  const byEmail = new Map();
  for (const a of alerts) {
    const p = byId[a.product_id];
    if (!p || p.in_stock === false || !inStockNow(p, a.color || "", a.size || "")) continue;
    if (!byEmail.has(a.email)) byEmail.set(a.email, []);
    byEmail.get(a.email).push({ alert: a, item: { name: p.name, nameZh: p.name_zh, imageUrl: p.image_url, color: a.color, size: a.size } });
  }
  if (!byEmail.size) return res.status(200).json({ sent: 0, customers: 0 });

  const siteConfig = await getSiteConfig(SUPABASE_URL, SUPABASE_ANON_KEY);
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  let customers = 0, failed = 0;
  for (const [email, entries] of byEmail) {
    const { subject, html, text } = backInStockEmail(entries.map((e) => e.item), siteConfig);
    try {
      await transporter.sendMail({ from: `Cippy <${process.env.GMAIL_USER}>`, to: email, subject, html, text });
    } catch (e) {
      failed++;
      console.error("back-in-stock email failed:", e.message);
      continue; // stays pending; the next stock save tries again
    }
    customers++;
    const idList = entries.map((e) => e.alert.id).join(",");
    await sb(`stock_alerts?id=in.(${idList})`, serviceKey, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ notified_at: new Date().toISOString() }) });
  }
  return res.status(200).json({ customers, failed });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });
  const body = req.body || {};

  if (body.action === "subscribe") return subscribe(body, serviceKey, res);
  if (body.action === "size_request") return sizeRequest(body, serviceKey, res);

  if (body.action === "notify") {
    const admin = await getVerifiedUser((req.headers.authorization || "").replace("Bearer ", ""));
    if (!(await isAdminUser(admin, SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))) return res.status(403).json({ error: "无权限" });
    return notify(body, serviceKey, res);
  }
  return res.status(400).json({ error: "Unknown action" });
}
