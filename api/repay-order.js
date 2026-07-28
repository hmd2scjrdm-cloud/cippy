import Stripe from "stripe";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

async function getVerifiedUser(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function getOrder(token, orderId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=*`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const data = r.ok ? await r.json() : [];
  return data[0] || null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe not configured" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const { orderId } = req.body || {};

  if (!orderId) return res.status(400).json({ error: "Missing orderId" });

  const user = await getVerifiedUser(token);
  if (!user) return res.status(401).json({ error: "请先登录" });

  const order = await getOrder(token, orderId);
  if (!order) return res.status(404).json({ error: "找不到订单" });
  if (order.status !== "pending") return res.status(400).json({ error: "该订单无需重新付款" });

  // Check 20-minute limit
  const ageMs = Date.now() - new Date(order.created_at).getTime();
  if (ageMs > 20 * 60 * 1000) {
    return res.status(410).json({ error: "订单已过期（超过20分钟），请重新下单" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const items = order.items || [];
  const totals = order.totals || {};

  const line_items = items.map(item => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: String(item.name_zh || item.name || "Item"),
        description: [item.size, item.color, item.variant].filter(Boolean).join(" / ") || undefined,
        images: item.image_url ? [item.image_url] : undefined,
      },
      unit_amount: Math.round(Number(item.price_myr || 0) * 100),
    },
    quantity: Number(item.qty || 1),
  }));

  const shipping = Number(totals.shipping || 0);
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
    customer_email: user.email,
    line_items,
    success_url: `${origin}/?checkout=success&order=${order.order_id}&session_id={CHECKOUT_SESSION_ID}&repay=1`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });

  return res.status(200).json({ url: session.url });
}
