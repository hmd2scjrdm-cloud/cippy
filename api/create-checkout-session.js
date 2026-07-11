import Stripe from "stripe";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

async function getVerifiedUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const { customer = {}, items = [], totals = {}, giftNote = "" } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const user = await getVerifiedUser(req);
  if (!user) return res.status(401).json({ error: "请先登录账号" });
  if (!user.email_confirmed_at && !user.confirmed_at) return res.status(403).json({ error: "请先验证邮箱" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const orderId = `CIPPY-${Date.now().toString().slice(-8)}`;

  const line_items = items.map(item => ({
    price_data: {
      currency: "myr",
      product_data: {
        name: String(item.name_zh || item.name || "Item"),
        description: [item.variant, item.color, item.size].filter(Boolean).join(" / ") || undefined,
        images: item.image_url ? [item.image_url] : undefined,
      },
      unit_amount: Math.round(Number(item.price_myr || 0) * 100),
    },
    quantity: Number(item.qty || 1),
  }));

  const shipping = Number(totals.shipping || 0);
  if (shipping > 0) {
    line_items.push({
      price_data: {
        currency: "myr",
        product_data: { name: "Shipping" },
        unit_amount: Math.round(shipping * 100),
      },
      quantity: 1,
    });
  }

  const origin = req.headers.origin || "https://cippy.vercel.app";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items,
    metadata: {
      orderId,
      customerName: String(customer.name || "").slice(0, 500),
      customerPhone: String(customer.phone || "").slice(0, 500),
      address: String(customer.address || "").slice(0, 500),
      giftNote: String(giftNote || "").slice(0, 500),
    },
    shipping_address_collection: undefined,
    success_url: `${origin}/thankyou.html?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart.html`,
  });

  return res.status(200).json({ url: session.url, orderId });
}
