import nodemailer from "nodemailer";
import { getSiteConfig, shippingFee, emailCompanyFooterHtml } from "./_lib/site-config.js";
import { isAdminUser } from "./_lib/admin-auth.js";
import { orderRevisionEmail } from "./_lib/order-revision-email.js";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

async function getVerifiedUser(token) {
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

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!(await isAdminUser(admin, SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))) return res.status(403).json({ error: "无权限" });

  const { action, id, trackingNumber, photoUrl, courier: requestedCourier, trackingUrl: requestedTrackingUrl } = req.body || {};
  if (!id || (action !== 'order-revision' && !trackingNumber)) return res.status(400).json({ error: "Missing id or trackingNumber" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const orders = orderRes.ok ? await orderRes.json() : [];
  const order = orders[0];
  if (!order) return res.status(404).json({ error: "找不到订单" });

  if (action === 'order-revision') {
    const email = String(order.customer?.email || order.guest_email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "顾客没有有效邮箱，无法寄送更新副本" });
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return res.status(500).json({ error: "邮件服务未配置" });
    const ownerEmail = clean(process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER).toLowerCase();
    const message = orderRevisionEmail(order, req.body?.note);
    try {
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
      await transporter.sendMail({ from: `Cippy <${process.env.GMAIL_USER}>`, to: email, ...(ownerEmail && ownerEmail !== email.toLowerCase() ? { bcc: ownerEmail } : {}), subject: message.subject, html: message.html, text: message.text });
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('order revision email failed', error);
      return res.status(502).json({ error: '订单已保存，但更新邮件寄送失败' });
    }
  }

  const customer = order.customer || {};
  const customerEmail = clean(customer.email || order.guest_email).toLowerCase();
  const ownerEmail = clean(process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER).toLowerCase();
  const recipientEmail = customerEmail.includes("@") ? customerEmail : ownerEmail;
  if (!recipientEmail.includes("@")) return res.status(500).json({ error: "店主通知邮箱未配置" });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: "邮件服务未配置" });
  }

  const siteConfig = await getSiteConfig(SUPABASE_URL, SUPABASE_ANON_KEY);
  const tracking = clean(trackingNumber);
  const orderId = clean(order.order_id);
  const easyParcel = customer.easyparcel || {};
  const courier = clean(requestedCourier || easyParcel.courier || "SPX Express");
  let trackingUrl = clean(requestedTrackingUrl || easyParcel.tracking_url || (courier === "SPX Express" ? "https://spx.com.my" : ""));
  try {
    const parsed = new URL(trackingUrl);
    if (parsed.protocol !== "https:") trackingUrl = "";
    else trackingUrl = parsed.href;
  } catch { trackingUrl = ""; }
  const trackingLine = trackingUrl
    ? `您可以前往 <a href="${trackingUrl}" style="color:#C4928A;">物流查询页面</a> 查看实时状态。<br/>Track your parcel on the <a href="${trackingUrl}" style="color:#C4928A;">courier tracking page</a>.`
    : "请使用以上运单号前往快递公司官网查询物流状态。<br/>Use the tracking number above on the courier's official tracking page.";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
      <tr><td style="text-align:center;padding-bottom:32px;">
        <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.2em;color:#111827;">CIPPY</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 4px;font-size:11px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;">Your order has shipped</p>
            <p style="margin:0 0 16px;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:0.05em;">${orderId}</p>
            <p style="margin:0;font-size:13px;color:#d1d5db;">Hi ${clean(customer.name, "there")}, great news — your Cippy order is on its way! 🎉</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:28px;">
            <div style="background:#fdf6f4;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">快递公司 / Courier</p>
              <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">${courier}</p>
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">运单号 / Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;letter-spacing:0.03em;">${tracking}</p>
            </div>
            <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">${trackingLine}</p>
            ${photoUrl ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">打包实拍 / Packing Photo</p><img src="${clean(photoUrl)}" width="100%" style="border-radius:10px;display:block;margin-bottom:16px;max-height:320px;object-fit:cover;" alt="Packing photo"/>` : ""}
            <div style="border-top:1px solid #f3f4f6;margin:20px 0;"></div>
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-weight:500;">寄送至 / Delivering to</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${clean(customer.name)}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">${clean(customer.address).replace(/\n/g, "<br>")}</p>
          </td></tr>
          <tr><td style="padding:0 28px 28px;">
            <div style="background:#fdf6f4;border-radius:12px;padding:20px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">售后须知 / After-Sales Notice</p>
              <p style="margin:0 0 14px;font-size:12px;color:#6b7280;line-height:1.6;">收到包裹后，请先阅读以下内容。<br/>Please read this when your parcel arrives.</p>

              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827;">📹 请全程录制开箱视频 / Record an unboxing video</p>
              <ul style="margin:0 0 14px;padding-left:18px;font-size:12px;color:#4b5563;line-height:1.7;">
                <li>拆包前开始录制，先拍清楚未拆封的包裹，中途不暂停、不剪辑。<br/><span style="color:#9ca3af;">Start recording before you open the parcel. Show it sealed, and do not pause or cut.</span></li>
                <li>逐件拍摄商品正面、背面和吊牌；有问题的部位请近距离特写；如有色差请在自然光下对比。<br/><span style="color:#9ca3af;">Show the front, back and tag of every item, and a close-up of any defect.</span></li>
                <li>视频请保存至少 14 天。<br/><span style="color:#9ca3af;">Please keep the video for at least 14 days.</span></li>
              </ul>

              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827;">⏱ 收货后 24 小时内联系我们 / Contact us within 24 hours</p>
              <p style="margin:0 0 14px;font-size:12px;color:#4b5563;line-height:1.7;">通过 <a href="https://wa.me/601120861073" style="color:#C4928A;">WhatsApp</a> 提供订单号、开箱视频和照片，我们会在 1–2 个工作日内审核。逾期或没有完整开箱视频，恕不受理。<br/><span style="color:#9ca3af;">WhatsApp us your order number, the video and photos. We review within 1-2 working days. Late requests or requests without a complete unboxing video cannot be accepted.</span></p>

              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827;">🔁 可申请 / Eligible</p>
              <p style="margin:0 0 14px;font-size:12px;color:#4b5563;line-height:1.7;">错发商品（款式、颜色、尺码）、与描述严重不符、明显制造缺陷。每笔订单限换货 1 次。若属本店责任，来回运费由我们承担。<br/><span style="color:#9ca3af;">Wrong item, major mismatch with the description, or a clear manufacturing defect. One exchange per order. If the issue is on our side, we cover shipping both ways.</span></p>

              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111827;">🚫 不接受 / Not accepted</p>
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.7;">不喜欢颜色或款式、1–3cm 尺寸误差、轻微色差、已穿着或洗涤或去除吊牌的商品、特卖商品、配饰类商品。退回商品须全新、附吊牌、无气味污渍。<br/><span style="color:#9ca3af;">Change of mind, 1-3cm measurement difference, minor colour difference, worn / washed / tag removed items, sale items and accessories. Returned items must be brand new with tags, free from scent and stains.</span></p>
            </div>
          </td></tr>
          <tr><td style="background:#f9fafb;padding:20px 28px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">如有任何问题，欢迎通过 <a href="https://wa.me/601120861073" style="color:#C4928A;">WhatsApp</a> 联系我们。<br/>Questions? Message us on <a href="https://wa.me/601120861073" style="color:#C4928A;">WhatsApp</a>.</p>
            ${emailCompanyFooterHtml(siteConfig, "#9ca3af")}
            <p style="margin:0;font-size:11px;color:#d1d5db;letter-spacing:0.08em;">© 2026 CIPPY · All rights reserved</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `Cippy <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      ...(recipientEmail !== ownerEmail ? { bcc: ownerEmail } : {}),
      subject: `Cippy 订单 ${orderId} 已发货 · Your order has shipped`,
      html,
      text: `订单 ${orderId} 已发货\n快递公司: ${courier}\n运单号: ${tracking}${trackingUrl ? `\n物流查询: ${trackingUrl}` : ""}\n\n售后须知：请在拆包前开始录制完整开箱视频（保存至少14天）；如有问题请在收货后24小时内通过 WhatsApp 联系我们 (https://wa.me/601120861073)，并提供订单号、视频和照片。无完整开箱视频、逾期、已穿着/洗涤/去吊牌、特卖及配饰类商品不受理。\nAfter-sales: record a complete unboxing video before opening the parcel (keep it 14 days) and contact us on WhatsApp within 24 hours with your order number, video and photos.`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("notify-shipped error:", err);
    return res.status(500).json({ error: "邮件发送失败" });
  }
}
