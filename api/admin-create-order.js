import { nextOrderId } from "./_lib/next-order-id.js";
import { isAdminUser } from "./_lib/admin-auth.js";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

const ALLOWED_STATUS = ["pending", "paid", "processing", "shipped", "delivered"];

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

// Manual (WhatsApp / offline / cash) orders. The orders table's RLS doesn't let the admin's own
// session INSERT, so this writes with the service role after verifying the caller is the admin.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!(await isAdminUser(admin, SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))) return res.status(403).json({ error: "无权限" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });

  const { customer = {}, items = [], shipping = 0, discount = 0, discountNote = "", createdAt = "", status = "paid", paymentMethod = "manual" } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "请至少添加一件商品" });
  if (!ALLOWED_STATUS.includes(status)) return res.status(400).json({ error: "订单状态不合法" });

  const cleanItems = items.map(i => ({
    product_id: i.product_id || null,
    name: String(i.name || i.name_zh || "").slice(0, 200),
    name_zh: String(i.name_zh || i.name || "").slice(0, 200),
    qty: Math.max(1, parseInt(i.qty, 10) || 1),
    price_myr: Math.max(0, Number(i.price_myr) || 0),
    color: i.color || undefined,
    size: i.size || undefined,
  })).filter(i => i.name_zh);
  if (!cleanItems.length) return res.status(400).json({ error: "请至少添加一件商品" });

  const shippingNum = Math.max(0, Number(shipping) || 0);
  const subtotal = cleanItems.reduce((s, i) => s + i.price_myr * i.qty, 0);
  // Discount is a flat RM amount taken off the order; it can never push the total below zero.
  const discountNum = Math.min(Math.max(0, Number(discount) || 0), subtotal + shippingNum);
  const email = String(customer.email || "").trim();

  // Optional back-dated order (manual entry of an earlier sale): not in the future, not older than 5 years.
  let createdIso = null;
  if (createdAt) {
    const d = new Date(createdAt);
    const now = Date.now();
    if (Number.isNaN(d.getTime()) || d.getTime() > now + 24 * 3600e3 || d.getTime() < now - 5 * 365 * 24 * 3600e3) {
      return res.status(400).json({ error: "创建日期不合法" });
    }
    createdIso = d.toISOString();
  }

  const row = {
    ...(createdIso ? { created_at: createdIso } : {}),
    order_id: await nextOrderId(SUPABASE_URL, serviceKey),
    customer: {
      name: String(customer.name || "").trim(),
      phone: String(customer.phone || "").trim(),
      email,
      address: String(customer.address || "").trim(),
    },
    guest_email: email || null,
    items: cleanItems,
    totals: { subtotal, shipping: shippingNum, discount: discountNum, discount_note: String(discountNote || "").slice(0, 120), total: subtotal + shippingNum - discountNum },
    status,
    payment_method: String(paymentMethod).slice(0, 40),
  };

  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const err = await r.text().catch(() => "");
    console.error("admin-create-order insert failed:", r.status, err);
    return res.status(500).json({ error: "订单保存失败", details: err });
  }
  const [created] = await r.json();
  return res.status(200).json({ order: created });
}
