import Stripe from "stripe";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

function headers(key, extra = {}) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...extra };
}

async function getVerifiedUser(token) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function sbGet(path, token) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
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

async function sbUpsert(path, body, token) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: { ...headers(SUPABASE_ANON_KEY, { Authorization: `Bearer ${token}` }), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
}

async function deductInventory(items, serviceKey) {
  if (!serviceKey) return; // skip if no service role key configured
  for (const item of items) {
    const pid = item.product_id || item.id;
    if (!pid) continue;
    const qty = Number(item.qty || 1);

    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}&select=stock,sizes`, {
      headers: headers(serviceKey),
    });
    if (!r.ok) continue;
    const [prod] = await r.json();
    if (!prod) continue;

    const newStock = Math.max(0, Number(prod.stock || 0) - qty);

    // Deduct from color×size matrix
    const newSizes = (prod.sizes || []).map(s => {
      if (s.color === item.color && s.size === item.size) {
        return { ...s, stock: Math.max(0, Number(s.stock || 0) - qty) };
      }
      return s;
    });

    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${pid}`, {
      method: "PATCH",
      headers: { ...headers(serviceKey), Prefer: "return=minimal" },
      body: JSON.stringify({ stock: newStock, sizes: newSizes }),
    });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const { orderId, sessionId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "Missing orderId" });

  const user = await getVerifiedUser(token);
  if (!user) return res.status(401).json({ error: "未登录" });

  const orders = await sbGet(`orders?order_id=eq.${orderId}&select=*`, token);
  const order = orders?.[0];
  if (!order) return res.status(404).json({ error: "找不到订单" });

  // Idempotent — already confirmed
  if (order.status === "paid") {
    return res.status(200).json({ ok: true, pointsEarned: 0, alreadyPaid: true });
  }
  if (order.status !== "pending") {
    return res.status(400).json({ error: "订单状态异常" });
  }

  // Verify Stripe payment
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: "Stripe not configured" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const stripeSessionId = sessionId || order.stripe_session_id;
  if (!stripeSessionId) return res.status(400).json({ error: "Missing Stripe session" });

  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
  } catch (e) {
    return res.status(400).json({ error: "无法验证支付状态" });
  }
  if (stripeSession.payment_status !== "paid") {
    return res.status(402).json({ error: "支付未完成" });
  }

  // Mark order paid
  await sbPatch(`orders?order_id=eq.${orderId}`, { status: "paid" }, SUPABASE_ANON_KEY);

  // Deduct inventory (uses service role key to bypass RLS on products table)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { await deductInventory(order.items || [], serviceKey); } catch (e) { console.error("Inventory deduct error:", e.message); }

  // Award points
  const orderTotal = Number(order.totals?.total || 0);
  const profiles = await sbGet(`profiles?id=eq.${user.id}&select=points,total_spent,tier`, token);
  const profile = profiles?.[0] || { points: 0, total_spent: 0, tier: "Classic" };
  const newTotalSpent = Number(profile.total_spent || 0) + orderTotal;
  const tier = newTotalSpent >= 2000 ? "Elite" : newTotalSpent >= 800 ? "Luxe" : "Classic";
  const multiplier = tier === "Elite" ? 2 : tier === "Luxe" ? 1.5 : 1;
  const pointsEarned = Math.floor(orderTotal * multiplier);
  const newPoints = Number(profile.points || 0) + pointsEarned;
  await sbUpsert("profiles", { id: user.id, points: newPoints, total_spent: newTotalSpent, tier }, token);

  return res.status(200).json({ ok: true, pointsEarned, newPoints, tier });
}
