import Stripe from "stripe";
import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

async function getVerifiedUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function sbPost(path, body, token) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(body),
  });
}

async function updatePoints(token, userId, orderTotal) {
  // Get current profile
  const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=points,total_spent,tier`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const profiles = r.ok ? await r.json() : [];
  const profile = profiles[0] || { points: 0, total_spent: 0, tier: "Classic" };

  const newTotalSpent = Number(profile.total_spent || 0) + Number(orderTotal);
  const tier = newTotalSpent >= 2000 ? "Elite" : newTotalSpent >= 800 ? "Luxe" : "Classic";
  const multiplier = tier === "Elite" ? 2 : tier === "Luxe" ? 1.5 : 1;
  const pointsEarned = Math.floor(Number(orderTotal) * multiplier);
  const newPoints = Number(profile.points || 0) + pointsEarned;

  await sbPost("profiles", { id: userId, points: newPoints, total_spent: newTotalSpent, tier }, token);
  return { pointsEarned, newPoints, tier };
}

function buildEmailHtml({ orderId, customer, items, totals, pointsEarned, tier }) {
  const itemRows = (items || []).map(item => {
    const name = clean(item.name_zh || item.name || "Item");
    const details = [item.size, item.color, item.variant].filter(Boolean).map(clean).join(" · ");
    const qty = Number(item.qty || 1);
    const price = Number(item.price_myr || 0) * qty;
    const img = item.image_url
      ? `<img src="${clean(item.image_url)}" width="64" height="80" style="width:64px;height:80px;object-fit:cover;border-radius:10px;display:block;" alt="">`
      : `<div style="width:64px;height:80px;background:#f0ebe8;border-radius:10px;"></div>`;
    return `
      <tr><td style="padding:14px 0;border-bottom:1px solid #f0ebe8;vertical-align:middle;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="78" style="vertical-align:middle;padding-right:14px;">${img}</td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#201a1b;">${name}</p>
            ${details ? `<p style="margin:0 0 3px;font-size:12px;color:#857374;">${details}</p>` : ""}
            <p style="margin:0;font-size:12px;color:#857374;">数量：${qty}</p>
          </td>
          <td width="90" style="vertical-align:middle;text-align:right;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#201a1b;">MYR ${price.toFixed(2)}</p>
          </td>
        </tr></table>
      </td></tr>`;
  }).join("");

  const subtotal = Number(totals?.subtotal || 0);
  const shipping = Number(totals?.shipping || 0);
  const total = Number(totals?.total || subtotal + shipping);
  const pointsRow = pointsEarned ? `<tr><td style="padding:6px 0;font-size:13px;color:#306946;">获得积分</td><td style="text-align:right;padding:6px 0;font-size:13px;color:#306946;font-weight:600;">+${pointsEarned} pts</td></tr>` : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#faf7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f5;padding:40px 16px;">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

  <tr><td style="text-align:center;padding-bottom:28px;">
    <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:0.2em;color:#201a1b;">CIPPY</p>
  </td></tr>

  <tr><td style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#77555a;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 4px;font-size:11px;color:#e7bcc0;letter-spacing:0.12em;text-transform:uppercase;">Order Confirmation</p>
        <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#fff;letter-spacing:0.04em;">${clean(orderId)}</p>
        <p style="margin:0;font-size:13px;color:#ffd9dd;">谢谢您，${clean(customer?.name || "亲爱的顾客")}！我们已收到您的订单，正在为您准备。</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:24px 28px 0;">

        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#857374;font-weight:600;">寄送至</p>
        <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:#201a1b;">${clean(customer?.name)}</p>
        <p style="margin:0 0 3px;font-size:13px;color:#524344;">${clean(customer?.phone)}</p>
        <p style="margin:0 0 20px;font-size:13px;color:#524344;">${clean(customer?.address).replace(/\n/g, "<br>")}</p>

        <div style="border-top:1px solid #f0ebe8;margin-bottom:20px;"></div>

        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#857374;font-weight:600;">商品明细</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">${itemRows}</table>

        <div style="border-top:1px solid #f0ebe8;margin:8px 0 14px;"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
          <tr><td style="font-size:13px;color:#524344;padding:4px 0;">小计</td><td style="text-align:right;font-size:13px;color:#524344;padding:4px 0;">${fmt.format(subtotal)}</td></tr>
          <tr><td style="font-size:13px;color:#524344;padding:4px 0;">运费</td><td style="text-align:right;font-size:13px;color:#524344;padding:4px 0;">${shipping === 0 ? "FREE" : fmt.format(shipping)}</td></tr>
          ${pointsRow}
        </table>
        <div style="border-top:2px solid #201a1b;margin-bottom:10px;"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="font-size:16px;font-weight:700;color:#201a1b;">合计</td>
            <td style="text-align:right;font-size:16px;font-weight:700;color:#201a1b;">${fmt.format(total)}</td>
          </tr>
        </table>

      </td></tr>
      <tr><td style="background:#faf7f5;padding:18px 28px;border-top:1px solid #f0ebe8;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#524344;">如有疑问请通过 Instagram 或 WhatsApp 联系我们</p>
        <p style="margin:0;font-size:11px;color:#857374;letter-spacing:0.08em;">© 2025 CIPPY · All rights reserved</p>
      </td></tr>
    </table>

  </td></tr>
</table></td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe not configured" });

  const { customer = {}, items = [], totals = {}, giftNote = "", guestMode = false } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = token ? await getVerifiedUser(req) : null;
  // Guest checkout allowed — only skip if neither guest nor logged in
  if (!guestMode && !user) return res.status(401).json({ error: "请先登录账号" });
  if (user && !user.email_confirmed_at && !user.confirmed_at) return res.status(403).json({ error: "请先验证邮箱" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Sequential order number starting from 100010
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: 'count=exact', Range: '0-0' },
  });
  const contentRange = countRes.headers.get('content-range') || '0/0';
  const totalOrders = parseInt(contentRange.split('/')[1] || '0', 10);
  const orderId = String(100010 + totalOrders);

  // Fetch real prices from DB — never trust frontend price
  const productIds = [...new Set(items.map(i => i.product_id || i.id).filter(Boolean))];
  const priceRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=in.(${productIds.join(',')})&select=id,price_myr,name_zh,name,image_url`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
  );
  const dbProducts = priceRes.ok ? await priceRes.json() : [];
  const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, p]));

  // Validate every item has a known product with a real price
  for (const item of items) {
    const pid = item.product_id || item.id;
    if (!pid || !priceMap[pid]) return res.status(400).json({ error: `商品不存在：${item.name_zh || pid}` });
    const dbPrice = Number(priceMap[pid].price_myr || 0);
    if (dbPrice <= 0) return res.status(400).json({ error: `商品价格异常：${item.name_zh}` });
    // Use variant price if applicable (variants can have different prices)
    const variantPrice = item.variant_price_myr ? Number(item.variant_price_myr) : null;
    item._verified_price = variantPrice && variantPrice > 0 ? variantPrice : dbPrice;
  }

  const shipping = Number(totals.shipping || 0);
  const verifiedSubtotal = items.reduce((s, i) => s + i._verified_price * Number(i.qty || 1), 0);
  const verifiedTotal = verifiedSubtotal + shipping;
  const orderTotal = verifiedTotal;

  // Rebuild totals from verified prices
  const verifiedTotals = { ...totals, subtotal: verifiedSubtotal, total: verifiedTotal };

  const line_items = items.map(item => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: String(item.name_zh || item.name || "Item"),
        description: [item.size, item.color, item.variant].filter(Boolean).join(" / ") || undefined,
        images: item.image_url ? [item.image_url] : undefined,
      },
      unit_amount: Math.round(item._verified_price * 100),
    },
    quantity: Number(item.qty || 1),
  }));

  if (shipping > 0) {
    line_items.push({
      price_data: { currency: "myr", product_data: { name: "Shipping" }, unit_amount: Math.round(shipping * 100) },
      quantity: 1,
    });
  }

  const origin = req.headers.origin || "https://cippy.vercel.app";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user?.email || customer.email || undefined,
    line_items,
    metadata: { orderId, customerName: String(customer.name || "").slice(0, 500) },
    success_url: `${origin}/thankyou.html?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart.html`,
  });

  // Save order to Supabase with verified prices
  await sbPost("orders", {
    order_id: orderId,
    user_id: user?.id || null,
    guest_email: user ? null : (customer.email || null),
    customer,
    items: items.map(i => ({ ...i, price_myr: i._verified_price })),
    totals: verifiedTotals,
    status: "pending",
    stripe_session_id: session.id,
  }, token);

  // Send confirmation email (points not yet awarded — awarded after payment on thankyou.html)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      const html = buildEmailHtml({ orderId, customer, items, totals, pointsEarned: 0 });
      await transporter.sendMail({
        from: `Cippy <${process.env.GMAIL_USER}>`,
        to: user.email,
        bcc: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
        subject: `Cippy 订单确认 ${orderId}`,
        html,
        text: `订单 ${orderId}\n\n顾客：${clean(customer.name)}\n电话：${clean(customer.phone)}\n地址：${clean(customer.address)}\n\n合计：${fmt.format(orderTotal)}`,
      });
    } catch (e) {
      console.error("Email error:", e.message);
    }
  }

  return res.status(200).json({ url: session.url, orderId });
}
