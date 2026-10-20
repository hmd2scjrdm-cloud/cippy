import { isAdminUser } from "./_lib/admin-auth.js";
import { easyParcelCall, easyParcelConfig, stateCode, validateConfig } from "./_lib/easyparcel.js";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

function clean(value, max = 100) { return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max); }
function positive(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : fallback; }
function malaysiaDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function verifiedAdmin(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  const user = r.ok ? await r.json() : null;
  return (await isAdminUser(user, SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)) ? user : null;
}

async function getOrder(id, serviceKey) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const rows = r.ok ? await r.json() : [];
  return rows[0] || null;
}

async function updateOrder(id, patch, serviceKey) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("Unable to save EasyParcel details to the order");
}

function parcelInput(body, order) {
  const recipient = body.recipient || {};
  const parcel = body.parcel || {};
  const customer = order.customer || {};
  return {
    recipient: {
      name: clean(recipient.name || customer.name, 35),
      phone: clean(recipient.phone || customer.phone, 16),
      email: clean(recipient.email || customer.email || order.guest_email || process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER, 35),
      address1: clean(recipient.address1, 35),
      address2: clean(recipient.address2, 35),
      address3: clean(recipient.address3, 35),
      city: clean(recipient.city, 35),
      state: stateCode(recipient.state),
      postcode: clean(recipient.postcode, 10),
    },
    parcel: {
      weight: positive(parcel.weight, 0.5),
      width: positive(parcel.width, 20),
      length: positive(parcel.length, 28),
      height: positive(parcel.height, 8),
      value: positive(order.totals?.subtotal || order.totals?.total, 1),
    },
  };
}

function validateShipment(input) {
  const r = input.recipient;
  const missing = ["name", "phone", "address1", "city", "state", "postcode"].filter(k => !r[k]);
  if (missing.length) return `Missing recipient details: ${missing.join(", ")}`;
  if (!/^\d{5}$/.test(r.postcode)) return "Receiver postcode must contain 5 digits";
  return "";
}

function rateRows(data) {
  const row = Array.isArray(data.result) ? data.result[0] : null;
  if (!row || String(row.status).toLowerCase() !== "success") throw new Error(row?.remarks || "No EasyParcel rates available");
  return (row.rates || []).map(rate => ({
    serviceId: clean(rate.service_id, 20), courier: clean(rate.courier_name, 80),
    service: clean(rate.service_name || rate.service_detail, 100), delivery: clean(rate.delivery, 100),
    price: Number(rate.price || 0), logo: clean(rate.courier_logo, 400), pickupDate: clean(rate.pickup_date, 30),
  })).filter(rate => rate.serviceId && rate.courier && rate.price > 0).sort((a, b) => a.price - b.price);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!(await verifiedAdmin(req))) return res.status(403).json({ error: "无权限" });

  const config = easyParcelConfig();
  const configError = validateConfig(config);
  if (configError) return res.status(503).json({ error: configError, setupRequired: true, mode: config.mode });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured" });

  try {
    const { action, orderId } = req.body || {};
    const order = await getOrder(orderId, serviceKey);
    if (!order) return res.status(404).json({ error: "找不到订单" });
    const input = parcelInput(req.body || {}, order);
    const inputError = validateShipment(input);
    if (inputError) return res.status(400).json({ error: inputError });

    if (action === "rates") {
      const data = await easyParcelCall(config, "EPRateCheckingBulk", { bulk: [{
        pick_code: config.sender.postcode, pick_state: config.sender.state, pick_country: "MY",
        send_code: input.recipient.postcode, send_state: input.recipient.state, send_country: "MY",
        weight: input.parcel.weight, width: input.parcel.width, length: input.parcel.length,
        height: input.parcel.height, parcel_value: input.parcel.value,
      }], exclude_fields: ["rates.*.pickup_point", "rates.*.dropoff_point"] });
      return res.status(200).json({ ok: true, mode: config.mode, rates: rateRows(data) });
    }

    if (action === "book") {
      if (!['paid', 'processing'].includes(String(order.status || '').toLowerCase())) {
        return res.status(409).json({ error: "只有已付款或处理中的订单可以建立正式运单" });
      }
      if (order.customer?.easyparcel?.awb) {
        return res.status(409).json({ error: `该订单已有 EasyParcel 运单：${clean(order.customer.easyparcel.awb, 60)}` });
      }
      const serviceId = clean(req.body?.serviceId, 20);
      if (!serviceId) return res.status(400).json({ error: "请选择快递服务" });
      const shipment = {
        weight: input.parcel.weight, width: input.parcel.width, length: input.parcel.length, height: input.parcel.height,
        content: "Clothing", value: input.parcel.value, service_id: serviceId, pick_point: "",
        pick_name: config.sender.name, pick_company: config.sender.company, pick_contact: config.sender.phone,
        pick_mobile: config.sender.phone, pick_addr1: config.sender.address1, pick_addr2: config.sender.address2,
        pick_addr3: "", pick_addr4: "", pick_city: config.sender.city, pick_state: config.sender.state,
        pick_code: config.sender.postcode, pick_country: "MY", send_point: "", send_name: input.recipient.name,
        send_company: "", send_contact: input.recipient.phone, send_mobile: input.recipient.phone,
        send_addr1: input.recipient.address1, send_addr2: input.recipient.address2, send_addr3: input.recipient.address3,
        send_addr4: "", send_city: input.recipient.city, send_state: input.recipient.state,
        send_code: input.recipient.postcode, send_country: "MY", collect_date: clean(req.body?.collectDate, 10) || malaysiaDate(),
        sms: "0", send_email: input.recipient.email, REQ_ID: clean(order.order_id, 100),
        reference: clean(order.order_id, 25), cod_enabled: "false",
      };
      const submitted = await easyParcelCall(config, "EPSubmitOrderBulk", {
        bulk: [shipment], idempotency_key: `cippy-${clean(order.id, 80)}-${serviceId}`,
      });
      const made = Array.isArray(submitted.result) ? submitted.result[0] : null;
      if (!made || String(made.status).toLowerCase() !== "success" || !made.order_number) {
        throw new Error(made?.remarks || "EasyParcel could not create the shipment order");
      }
      const paid = await easyParcelCall(config, "EPPayOrderBulk", { bulk: [{ order_no: made.order_number }] });
      const payment = Array.isArray(paid.result) ? paid.result[0] : null;
      const parcel = payment?.parcel?.[0] || {};
      if (!parcel.awb) throw new Error(payment?.messagenow || "EasyParcel payment did not return an AWB number");
      const courier = clean(made.courier, 80);
      const shipping = {
        provider: "EasyParcel", mode: config.mode, order_number: clean(made.order_number, 30),
        parcel_number: clean(parcel.parcelno || made.parcel_number, 30), awb: clean(parcel.awb, 60),
        courier, service_id: serviceId, price: Number(made.price || 0),
        awb_label_url: clean(parcel.awb_id_link, 500), tracking_url: clean(parcel.tracking_url, 500),
        booked_at: new Date().toISOString(), recipient: input.recipient, parcel: input.parcel,
      };
      await updateOrder(order.id, {
        status: "shipped", tracking_number: shipping.awb,
        customer: { ...(order.customer || {}), easyparcel: shipping },
      }, serviceKey);
      return res.status(200).json({ ok: true, shipment: shipping });
    }
    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("easyparcel error", error);
    return res.status(502).json({ error: error?.message || "EasyParcel request failed" });
  }
}

