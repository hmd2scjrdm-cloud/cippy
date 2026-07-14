import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function sbGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  return r.ok ? r.json() : null;
}

async function sbPost(path, body, useServiceKey = false) {
  const key = useServiceKey ? (process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY) : SUPABASE_ANON_KEY;
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.BILLPLZ_API_KEY || !process.env.BILLPLZ_COLLECTION_ID) {
    return res.status(500).json({ error: "Billplz not configured" });
  }

  const { customer = {}, items = [], totals = {}, guestMode = false } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = token ? await getVerifiedUser(token) : null;

  // Guest is allowed — just no points
  if (!guestMode && !user) return res.status(401).json({ error: "请先登录账号" });

  // Re-fetch prices from DB (never trust frontend price)
  const productIds = [...new Set(items.map(i => i.product_id || i.id).filter(Boolean))];
  const priceRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=in.(${productIds.join(",")})&select=id,price_myr,name_zh,name`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  const dbProducts = priceRes.ok ? await priceRes.json() : [];
  const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, p]));

  for (const item of items) {
    if (item._is_discount) { item._verified_price = item.price_myr || 0; continue; }
    const pid = item.product_id || item.id;
    if (!pid || !priceMap[pid]) return res.status(400).json({ error: `商品不存在：${item.name_zh || pid}` });
    const dbPrice = Number(priceMap[pid].price_myr || 0);
    if (dbPrice <= 0) return res.status(400).json({ error: `商品价格异常` });
    const variantPrice = item.variant_price_myr ? Number(item.variant_price_myr) : null;
    item._verified_price = variantPrice && variantPrice > 0 ? variantPrice : dbPrice;
  }

  const shipping = Number(totals.shipping || 0);
  const verifiedSubtotal = items.reduce((s, i) => s + i._verified_price * Number(i.qty || 1), 0);
  const verifiedTotal = verifiedSubtotal + shipping;
  const verifiedTotals = { ...totals, subtotal: verifiedSubtotal, total: verifiedTotal };

  // Sequential order ID
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "count=exact", Range: "0-0" },
  });
  const contentRange = countRes.headers.get("content-range") || "0/0";
  const totalOrders = parseInt(contentRange.split("/")[1] || "0", 10);
  const orderId = String(10010 + totalOrders);

  const origin = req.headers.origin || "https://cippy.vercel.app";
  const BILLPLZ_BASE = process.env.BILLPLZ_SANDBOX === "true"
    ? "https://www.billplz-sandbox.com/api/v3"
    : "https://www.billplz.com/api/v3";

  const authHeader = "Basic " + Buffer.from(`${process.env.BILLPLZ_API_KEY}:`).toString("base64");

  const billBody = new URLSearchParams({
    collection_id: process.env.BILLPLZ_COLLECTION_ID,
    email: user?.email || customer.email || "",
    name: clean(customer.name || "Customer"),
    phone: clean(customer.phone || ""),
    amount: Math.round(verifiedTotal * 100).toString(),
    callback_url: `${origin}/api/billplz-callback`,
    redirect_url: `${origin}/thankyou.html?order=${orderId}&method=billplz`,
    description: `Cippy Order ${orderId}`,
    reference_1_label: "Order",
    reference_1: orderId,
  });

  const billRes = await fetch(`${BILLPLZ_BASE}/bills`, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: billBody.toString(),
  });

  if (!billRes.ok) {
    const err = await billRes.json().catch(() => ({}));
    console.error("Billplz create bill error:", err);
    return res.status(502).json({ error: "无法创建 FPX 付款", details: err });
  }

  const bill = await billRes.json();

  // Save order (use service role key to bypass RLS)
  await sbPost("orders", {
    order_id: orderId,
    user_id: user?.id || null,
    guest_email: user ? null : (customer.email || null),
    customer,
    items: items.map(i => ({ ...i, price_myr: i._verified_price })),
    totals: verifiedTotals,
    status: "pending",
    payment_method: "billplz",
    billplz_bill_id: bill.id,
  }, true);

  // Send order email
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      const itemLines = items.map(i =>
        `${clean(i.name_zh || i.name)} x${i.qty} — ${fmt.format(i._verified_price * i.qty)}`
      ).join("\n");
      await transporter.sendMail({
        from: `Cippy <${process.env.GMAIL_USER}>`,
        to: user?.email || customer.email,
        bcc: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
        subject: `Cippy 订单 ${orderId} — 待付款 (FPX)`,
        text: `订单 ${orderId}\n\n顾客：${clean(customer.name)}\n电话：${clean(customer.phone)}\n地址：${clean(customer.address)}\n\n${itemLines}\n\n合计：${fmt.format(verifiedTotal)}\n\n付款方式：FPX (Billplz)`,
      });
    } catch (e) {
      console.error("Email error:", e.message);
    }
  }

  return res.status(200).json({ url: bill.url, orderId });
}
