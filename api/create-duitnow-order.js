import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

function clean(v) { return String(v ?? "").replace(/[<>]/g, "").trim(); }

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function sbFetch(path, opts = {}) {
  const key = opts.serviceKey || SUPABASE_ANON_KEY;
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal", ...(opts.headers || {}) },
  });
}

async function deductInventory(items, serviceKey) {
  if (!serviceKey) return;
  for (const item of items) {
    if (item._is_discount) continue;
    const pid = item.product_id || item.id;
    if (!pid) continue;
    const qty = Number(item.qty || 1);
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}&select=stock,sizes`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!r.ok) continue;
    const [prod] = await r.json();
    if (!prod) continue;
    const newStock = Math.max(0, Number(prod.stock || 0) - qty);
    const newSizes = (prod.sizes || []).map(s =>
      s.color === item.color && s.size === item.size
        ? { ...s, stock: Math.max(0, Number(s.stock || 0) - qty) }
        : s
    );
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, {
      method: "PATCH",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ stock: newStock, in_stock: newStock > 0, sizes: newSizes }),
    });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer = {}, items = [], totals = {}, guestMode = false, giftNote = "" } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = token ? await getVerifiedUser(token) : null;
  if (!guestMode && !user) return res.status(401).json({ error: "请先登录账号" });

  // Re-fetch and verify prices from DB
  const productIds = [...new Set(items.filter(i => !i._is_discount).map(i => i.product_id || i.id).filter(Boolean))];
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
    const variantPrice = item.variant_price_myr ? Number(item.variant_price_myr) : null;
    item._verified_price = variantPrice && variantPrice > 0 ? variantPrice : dbPrice;
  }

  const shipping = Number(totals.shipping || 0);
  const verifiedSubtotal = items.reduce((s, i) => s + i._verified_price * Number(i.qty || 1), 0);
  const verifiedTotal = verifiedSubtotal + shipping;

  // Sequential order ID
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "count=exact", Range: "0-0" },
  });
  const contentRange = countRes.headers.get("content-range") || "0/0";
  const totalOrders = parseInt(contentRange.split("/")[1] || "0", 10);
  const orderId = String(100010 + totalOrders);

  // Save order to Supabase
  await sbFetch("orders", {
    method: "POST",
    body: JSON.stringify({
      order_id: orderId,
      user_id: user?.id || null,
      guest_email: user ? null : (customer.email || null),
      customer,
      items: items.map(i => ({ ...i, price_myr: i._verified_price })),
      totals: { subtotal: verifiedSubtotal, shipping, total: verifiedTotal },
      status: "pending_payment",
      payment_method: "duitnow",
      gift_note: giftNote || null,
    }),
  });

  // Deduct inventory immediately (optimistic — item is reserved)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  await deductInventory(items, serviceKey);

  // Send confirmation email to customer
  const customerEmail = user?.email || customer.email;
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && customerEmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      const itemLines = items
        .filter(i => !i._is_discount)
        .map(i => `• ${clean(i.name_zh || i.name)} x${i.qty}  —  ${fmt.format(i._verified_price * i.qty)}`)
        .join("\n");

      await transporter.sendMail({
        from: `Cippy <${process.env.GMAIL_USER}>`,
        to: customerEmail,
        bcc: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
        subject: `Cippy Order #${orderId} — Pending Payment (DuitNow QR)`,
        html: `
<div style="font-family:sans-serif;max-width:480px;margin:auto;color:#333">
  <h2 style="color:#C4928A">Thank you for your order! 🎀</h2>
  <p>Hi ${clean(customer.name)},</p>
  <p>Your order <strong>#${orderId}</strong> has been placed and is waiting for your DuitNow QR payment.</p>

  <div style="background:#fdf6f4;border-radius:12px;padding:16px;margin:16px 0">
    <p style="margin:0 0 8px;font-weight:bold">Order Summary</p>
    <pre style="font-size:13px;margin:0;white-space:pre-wrap">${itemLines}</pre>
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0"/>
    <p style="margin:0;font-size:14px">Shipping: ${fmt.format(shipping)}</p>
    <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#C4928A">Total: ${fmt.format(verifiedTotal)}</p>
  </div>

  <p><strong>Payment method:</strong> DuitNow QR</p>
  <p>Please scan the DuitNow QR code and transfer <strong>${fmt.format(verifiedTotal)}</strong> with reference <strong>#${orderId}</strong>.</p>
  <p>After payment, send your receipt screenshot to us on WhatsApp: <a href="https://wa.me/601120861073">+601120861073</a></p>

  <div style="background:#fdf6f4;border-radius:12px;padding:16px;margin:16px 0">
    <p style="margin:0 0 4px;font-weight:bold">Delivery Address</p>
    <p style="margin:0;font-size:13px">${clean(customer.address)}</p>
  </div>

  <p style="color:#999;font-size:12px">We'll confirm your order within 1 hour of receiving your payment receipt. Thank you for shopping with Cippy! 🌸</p>
</div>`,
      });
    } catch (e) {
      console.error("Email error:", e.message);
    }
  }

  return res.status(200).json({ orderId, total: verifiedTotal });
}
