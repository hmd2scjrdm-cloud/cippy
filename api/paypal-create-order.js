const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

// PayPal does not settle in MYR — purchase amounts are converted to this currency for the PayPal order.
// Set PAYPAL_CURRENCY and PAYPAL_MYR_RATE (units of PAYPAL_CURRENCY per 1 MYR) in Vercel env vars.
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
const PAYPAL_MYR_RATE = Number(process.env.PAYPAL_MYR_RATE || 0.21);
const PAYPAL_API = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function toPayPalAmount(myr) {
  return (Number(myr) * PAYPAL_MYR_RATE).toFixed(2);
}

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(500).json({ error: "PayPal not configured" });
  }

  const { customer = {}, items = [], totals = {}, guestMode = false, giftNote = "" } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = token ? await getVerifiedUser(token) : null;
  if (!guestMode && !user) return res.status(401).json({ error: "请先登录账号" });

  // Re-fetch and verify prices from DB — never trust frontend price
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

  // Sequential order ID (same scheme as Stripe/DuitNow orders)
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Prefer: "count=exact", Range: "0-0" },
  });
  const contentRange = countRes.headers.get("content-range") || "0/0";
  const totalOrders = parseInt(contentRange.split("/")[1] || "0", 10);
  const orderId = String(10010 + totalOrders);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  let accessToken;
  try {
    accessToken = await getPayPalAccessToken();
  } catch (e) {
    console.error("PayPal auth error:", e.message);
    return res.status(500).json({ error: "PayPal 授权失败" });
  }

  const ppOrderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: orderId,
        amount: { currency_code: PAYPAL_CURRENCY, value: toPayPalAmount(verifiedTotal) },
      }],
    }),
  });
  const ppOrder = await ppOrderRes.json();
  if (!ppOrderRes.ok) {
    console.error("PayPal order create failed:", ppOrder);
    return res.status(500).json({ error: "PayPal 订单创建失败" });
  }

  // Save order to Supabase as pending, matched to the PayPal order id
  const saveRes = await sbFetch("orders", {
    method: "POST",
    serviceKey,
    body: JSON.stringify({
      order_id: orderId,
      user_id: user?.id || null,
      guest_email: user ? null : (customer.email || null),
      customer,
      items: items.map(i => ({ ...i, price_myr: i._verified_price })),
      totals: { subtotal: verifiedSubtotal, shipping, total: verifiedTotal },
      status: "pending",
      payment_method: "paypal",
      paypal_order_id: ppOrder.id,
      gift_note: giftNote || null,
    }),
  });
  if (!saveRes.ok) {
    const saveErr = await saveRes.text().catch(() => "");
    console.error("PayPal order save failed:", saveRes.status, saveErr);
  }

  return res.status(200).json({ paypalOrderId: ppOrder.id, orderId });
}
