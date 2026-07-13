import crypto from "crypto";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

function verifyXSignature(params, xSignature, apiKey) {
  const sorted = Object.keys(params)
    .filter(k => k !== "x_signature")
    .sort()
    .map(k => `${k}${params[k]}`)
    .join("|");
  const expected = crypto.createHmac("sha256", apiKey).update(sorted).digest("hex");
  return expected === xSignature;
}

async function patchOrder(orderId, body, key) {
  return fetch(`${SUPABASE_URL}/rest/v1/orders?order_id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
}

async function deductInventory(items, serviceKey) {
  if (!serviceKey) return;
  for (const item of items) {
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
      body: JSON.stringify({ stock: newStock, sizes: newSizes }),
    });
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Billplz sends callback as POST (form-encoded) and redirect as GET
  const params = req.method === "GET"
    ? Object.fromEntries(new URL(req.url, "https://x").searchParams)
    : req.body || {};

  const billId = params.id;
  const paid = params.paid === "true";
  const xSig = params.x_signature;

  if (!billId) return res.status(400).json({ error: "Missing bill id" });

  // Verify X-Signature (only on POST callbacks, not GET redirects)
  if (req.method === "POST" && process.env.BILLPLZ_API_KEY && xSig) {
    if (!verifyXSignature(params, xSig, process.env.BILLPLZ_API_KEY)) {
      console.error("Billplz signature mismatch");
      return res.status(403).json({ error: "Invalid signature" });
    }
  }

  if (!paid) return res.status(200).json({ ok: true, status: "not_paid" });

  // Look up order by billplz_bill_id
  const ordersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?billplz_bill_id=eq.${encodeURIComponent(billId)}&select=order_id,status,user_id,totals,items`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  const orders = ordersRes.ok ? await ordersRes.json() : [];
  const order = orders[0];

  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.status === "paid") return res.status(200).json({ ok: true, alreadyPaid: true });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const writeKey = serviceKey || SUPABASE_ANON_KEY;

  // Mark paid
  await patchOrder(order.order_id, { status: "paid" }, writeKey);

  // Deduct inventory
  try { await deductInventory(order.items || [], serviceKey); } catch (e) { console.error("Inventory error:", e.message); }

  // Award points (only for registered users)
  if (order.user_id && serviceKey) {
    try {
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${order.user_id}&select=points,total_spent,tier`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const profiles = profileRes.ok ? await profileRes.json() : [];
      const profile = profiles[0] || { points: 0, total_spent: 0, tier: "Classic" };
      const orderTotal = Number(order.totals?.total || 0);
      const newTotalSpent = Number(profile.total_spent || 0) + orderTotal;
      const tier = newTotalSpent >= 2000 ? "Elite" : newTotalSpent >= 800 ? "Luxe" : "Classic";
      const multiplier = tier === "Elite" ? 2 : tier === "Luxe" ? 1.5 : 1;
      const pointsEarned = Math.floor(orderTotal * multiplier);
      const newPoints = Number(profile.points || 0) + pointsEarned;
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${order.user_id}`, {
        method: "PATCH",
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ points: newPoints, total_spent: newTotalSpent, tier }),
      });
    } catch (e) { console.error("Points error:", e.message); }
  }

  return res.status(200).json({ ok: true });
}
