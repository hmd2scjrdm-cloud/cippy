import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const PAYPAL_API = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...extra };
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

async function sbPatch(path, body, key) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "PATCH",
    headers: { ...headers(key), Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
}

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const r = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error("PayPal auth failed");
  const data = await r.json();
  return data.access_token;
}

async function deductInventory(items, serviceKey) {
  if (!serviceKey) return;
  for (const item of items) {
    if (item._is_discount) continue;
    const pid = item.product_id || item.id;
    if (!pid) continue;
    const qty = Number(item.qty || 1);
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}&select=stock,sizes`, { headers: headers(serviceKey) });
    if (!r.ok) continue;
    const [prod] = await r.json();
    if (!prod) continue;
    const newStock = Math.max(0, Number(prod.stock || 0) - qty);
    const newSizes = (prod.sizes || []).map(s =>
      s.color === item.color && s.size === item.size ? { ...s, stock: Math.max(0, Number(s.stock || 0) - qty) } : s
    );
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, {
      method: "PATCH",
      headers: { ...headers(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify({ stock: newStock, in_stock: newStock > 0, sizes: newSizes }),
    });
  }
}

async function sendConfirmationEmail(order, orderId) {
  const customerEmail = order.customer?.email;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !customerEmail) return;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    const items = order.items || [];
    const totals = order.totals || {};
    const itemLines = items
      .filter(i => !i._is_discount)
      .map(i => `• ${clean(i.name_zh || i.name)} x${i.qty}  —  ${fmt.format(i.price_myr * i.qty)}`)
      .join("\n");

    await transporter.sendMail({
      from: `Cippy <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      bcc: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
      subject: `Cippy 订单确认 ${orderId}`,
      html: `
<div style="font-family:sans-serif;max-width:480px;margin:auto;color:#333">
  <h2 style="color:#C4928A">Thank you for your order! 🎀</h2>
  <p>Hi ${clean(order.customer?.name)},</p>
  <p>Your order <strong>#${orderId}</strong> has been paid via PayPal and is being prepared.</p>
  <div style="background:#fdf6f4;border-radius:12px;padding:16px;margin:16px 0">
    <pre style="font-size:13px;margin:0;white-space:pre-wrap">${itemLines}</pre>
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0"/>
    <p style="margin:0;font-size:14px">Shipping: ${fmt.format(Number(totals.shipping || 0))}</p>
    <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#C4928A">Total: ${fmt.format(Number(totals.total || 0))}</p>
  </div>
  <p style="color:#999;font-size:12px">Thank you for shopping with Cippy! 🌸</p>
</div>`,
      text: `订单 ${orderId}\n\n${itemLines}\n\n合计：${fmt.format(Number(totals.total || 0))}`,
    });
  } catch (e) {
    console.error("Email error:", e.message);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: "PayPal not configured" });
  }

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const { orderId, paypalOrderId } = req.body || {};
  if (!orderId || !paypalOrderId) return res.status(400).json({ error: "Missing orderId or paypalOrderId" });

  const orders = await sbGet(`orders?order_id=eq.${orderId}&select=*`);
  const order = orders?.[0];
  if (!order) return res.status(404).json({ error: "找不到订单" });

  // Idempotent — already confirmed
  if (order.status === "paid") {
    return res.status(200).json({ ok: true, alreadyPaid: true });
  }
  if (order.paypal_order_id !== paypalOrderId) {
    return res.status(400).json({ error: "订单不匹配" });
  }

  let accessToken;
  try {
    accessToken = await getPayPalAccessToken();
  } catch (e) {
    return res.status(500).json({ error: "PayPal 授权失败" });
  }

  const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  const capture = await captureRes.json();
  if (!captureRes.ok || capture.status !== "COMPLETED") {
    console.error("PayPal capture failed:", capture);
    return res.status(402).json({ error: "PayPal 支付未完成" });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  // Mark order paid
  await sbPatch(`orders?order_id=eq.${orderId}`, { status: "paid" }, serviceKey);

  // Deduct inventory
  try { await deductInventory(order.items || [], serviceKey); } catch (e) { console.error("Inventory deduct error:", e.message); }

  // Award points (logged-in users only)
  let pointsEarned = 0;
  let newPoints = 0;
  let tier = "Classic";
  if (order.user_id && token) {
    const user = await getVerifiedUser(token);
    if (user && user.id === order.user_id) {
      const orderTotal = Number(order.totals?.total || 0);
      const profiles = await sbGet(`profiles?id=eq.${user.id}&select=points,total_spent,tier`);
      const profile = profiles?.[0] || { points: 0, total_spent: 0, tier: "Classic" };
      const newTotalSpent = Number(profile.total_spent || 0) + orderTotal;
      tier = newTotalSpent >= 2000 ? "Elite" : newTotalSpent >= 800 ? "Luxe" : "Classic";
      const multiplier = tier === "Elite" ? 2 : tier === "Luxe" ? 1.5 : 1;
      pointsEarned = Math.floor(orderTotal * multiplier);
      newPoints = Number(profile.points || 0) + pointsEarned;
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: "POST",
        headers: { ...headers(serviceKey), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ id: user.id, points: newPoints, total_spent: newTotalSpent, tier }),
      });
    }
  }

  await sendConfirmationEmail(order, orderId);

  return res.status(200).json({ ok: true, orderId, pointsEarned, newPoints, tier });
}
