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

export function bookingError(order, body) {
  const rebook = body?.rebook === true;
  const status = String(order.status || '').toLowerCase();
  if (!(rebook ? ['paid', 'processing', 'shipped', 'delivered', 'completed'] : ['paid', 'processing']).includes(status)) {
    return '只有已付款、处理中、已发货或已送达的订单可以建立或重新建立运单';
  }
  const oldAwb = clean(order.customer?.easyparcel?.awb, 60);
  if (!rebook && oldAwb) return `该订单已有 EasyParcel 运单：${oldAwb}`;
  if (rebook) {
    if (clean(body?.rebookReason, 300).length < 5) return '请填写重新建立运单的原因';
    if (clean(body?.expectedAwb, 60) !== oldAwb || clean(body?.expectedTracking, 60) !== clean(order.tracking_number, 60)) {
      return '旧运单资料已改变，请刷新订单后重新操作，避免重复扣款';
    }
    if (!/^[a-f0-9-]{36}$/i.test(String(body?.rebookAttemptId || ''))) return '缺少重新建立请求编号，请重新打开窗口';
  }
  return '';
}

export async function downloadAwb(order, res) {
  const shipment = order.customer?.easyparcel;
  if (!shipment?.awb || !shipment?.awb_label_url) return res.status(404).json({ error: "这张订单还没有可下载的 EasyParcel AWB" });
  let labelUrl;
  try { labelUrl = new URL(shipment.awb_label_url); } catch { return res.status(400).json({ error: "运单链接无效" }); }
  const easyParcelHost = /^(?:[a-z0-9-]+\.)*easyparcel\.(?:my|com)$/i.test(labelUrl.hostname);
  if (!easyParcelHost || !['http:', 'https:'].includes(labelUrl.protocol) || labelUrl.username || labelUrl.password) {
    return res.status(400).json({ error: "不是 EasyParcel 运单链接" });
  }
  labelUrl.protocol = 'https:';
  let label;
  let currentUrl = labelUrl;
  try {
    for (let hop = 0; hop < 4; hop += 1) {
      label = await fetch(currentUrl, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
      if (![301, 302, 303, 307, 308].includes(label.status)) break;
      const location = label.headers.get('location');
      if (!location) return res.status(502).json({ error: 'EasyParcel 运单跳转缺少地址' });
      const nextUrl = new URL(location, currentUrl);
      const host = nextUrl.hostname.toLowerCase();
      const trustedHost = /^(?:[a-z0-9-]+\.)*easyparcel\.(?:my|com)$/.test(host)
        || /^(?:[a-z0-9-]+\.)*s3[.-](?:[a-z0-9-]+\.)?amazonaws\.com$/.test(host)
        || /^(?:[a-z0-9-]+\.)*cloudfront\.net$/.test(host);
      if (nextUrl.protocol !== 'https:' || nextUrl.username || nextUrl.password || !trustedHost) {
        return res.status(502).json({ error: 'EasyParcel 运单跳转到未经允许的地址，已停止下载' });
      }
      currentUrl = nextUrl;
      if (hop === 3) return res.status(502).json({ error: 'EasyParcel 运单跳转次数过多' });
    }
  } catch (error) {
    console.error('EasyParcel AWB fetch failed', { orderId: order.id, host: labelUrl.hostname, error });
    return res.status(502).json({ error: '暂时无法连接 EasyParcel 取得运单，请稍后在本页重试' });
  }
  if (!label.ok) return res.status(502).json({ error: "EasyParcel 暂时无法提供 AWB，请稍后重试" });
  const declaredSize = Number(label.headers.get('content-length') || 0);
  if (declaredSize > 10_000_000) return res.status(502).json({ error: "AWB 文件超过 10MB" });
  const pdf = Buffer.from(await label.arrayBuffer());
  if (pdf.length > 10_000_000 || pdf.toString('ascii', 0, 5) !== '%PDF-') {
    return res.status(502).json({ error: "EasyParcel 返回的不是 PDF 运单" });
  }
  const safeOrder = clean(order.order_id || order.id, 60).replace(/[^a-zA-Z0-9_-]/g, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="cippy-awb-${safeOrder}.pdf"`);
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).send(pdf);
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
    if (action === 'download-awb') {
      const historyIndex = req.body?.historyIndex;
      if (historyIndex === undefined) return await downloadAwb(order, res);
      const history = order.customer?.easyparcel_history;
      if (!Array.isArray(history) || !Number.isInteger(historyIndex) || historyIndex < 0 || historyIndex >= history.length) {
        return res.status(404).json({ error: '找不到旧运单' });
      }
      return await downloadAwb({ ...order, customer: { easyparcel: history[historyIndex] } }, res);
    }
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
      const rebook = req.body?.rebook === true;
      const guardError = bookingError(order, req.body);
      if (guardError) return res.status(409).json({ error: guardError });
      const priorAwb = clean(order.customer?.easyparcel?.awb, 60);
      const priorTracking = clean(order.tracking_number, 60);
      const rebookReason = clean(req.body?.rebookReason, 300);
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
        // EasyParcel may email this address as soon as an AWB is booked. Keep customer notification for final dispatch.
        sms: "0", send_email: clean(process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER, 35), REQ_ID: clean(order.order_id, 100),
        reference: clean(order.order_id, 25), cod_enabled: "false",
      };
      const submitted = await easyParcelCall(config, "EPSubmitOrderBulk", {
        bulk: [shipment], idempotency_key: rebook ? `cippy-rebook-${clean(req.body.rebookAttemptId, 36)}` : `cippy-${clean(order.id, 80)}-${serviceId}`,
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
        ...(rebook ? { rebook_reason: rebookReason, previous_awb: priorAwb || priorTracking } : {}),
      };
      const oldHistory = Array.isArray(order.customer?.easyparcel_history) ? order.customer.easyparcel_history : [];
      const previous = order.customer?.easyparcel?.awb
        ? order.customer.easyparcel
        : priorTracking ? { awb: priorTracking, provider: 'Manual', archived_at: new Date().toISOString() } : null;
      const history = rebook && previous ? [...oldHistory, previous] : oldHistory;
      try {
        await updateOrder(order.id, {
          tracking_number: shipping.awb,
          customer: { ...(order.customer || {}), easyparcel: shipping, ...(rebook ? { easyparcel_history: history } : {}) },
        }, serviceKey);
      } catch (error) {
        console.error('EasyParcel AWB created but order save failed', { orderId: order.id, awb: shipping.awb, error });
        return res.status(502).json({ error: `EasyParcel 已取得 AWB ${shipping.awb}，但后台保存失败。请先到 EasyParcel 核对，勿直接重试，避免重复扣款。` });
      }
      return res.status(200).json({ ok: true, shipment: shipping, ...(rebook ? { history } : {}) });
    }
    return res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    console.error("easyparcel error", error);
    return res.status(502).json({ error: error?.message || "EasyParcel request failed" });
  }
}

