import nodemailer from "nodemailer";

// Temporary Supabase-free shipping notification, for use while the
// Supabase project is rate-limited and the normal notify-shipped.js
// flow (which needs Supabase Auth + the orders table) can't run.
// Remove this once Supabase access is restored.

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { secret, email, customerName, orderId, trackingNumber, photoUrl } = req.body || {};

  if (!process.env.MANUAL_NOTIFY_SECRET || secret !== process.env.MANUAL_NOTIFY_SECRET) {
    return res.status(403).json({ error: "无权限" });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: "邮件服务未配置" });
  }

  const customerEmail = clean(email).toLowerCase();
  if (!customerEmail.includes("@")) return res.status(400).json({ error: "邮箱格式不对" });
  if (!clean(orderId)) return res.status(400).json({ error: "缺少订单号" });
  if (!clean(trackingNumber)) return res.status(400).json({ error: "缺少运单号" });

  const orderIdClean = clean(orderId);
  const trackingClean = clean(trackingNumber);
  const nameClean = clean(customerName, "there");
  const photoClean = photoUrl ? clean(photoUrl) : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
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
            <p style="margin:0 0 16px;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:0.05em;">${orderIdClean}</p>
            <p style="margin:0;font-size:13px;color:#d1d5db;">Hi ${nameClean}, great news — your Cippy order is on its way! 🎉</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:28px;">
            <div style="background:#fdf6f4;border-radius:12px;padding:18px 20px;margin-bottom:20px;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">快递公司 / Courier</p>
              <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">SPX Express</p>
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">运单号 / Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;letter-spacing:0.03em;">${trackingClean}</p>
            </div>
            <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">您可以前往 <a href="https://spx.com.my" style="color:#C4928A;">spx.com.my</a> 官网，输入以上运单号查询实时物流状态。<br/>You can track your parcel in real time at <a href="https://spx.com.my" style="color:#C4928A;">spx.com.my</a> using the tracking number above.</p>
            ${photoClean ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;">打包实拍 / Packing Photo</p><img src="${photoClean}" width="100%" style="border-radius:10px;display:block;margin-bottom:16px;max-height:320px;object-fit:cover;" alt="Packing photo"/>` : ""}
          </td></tr>
          <tr><td style="background:#f9fafb;padding:20px 28px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">如有任何问题，欢迎通过 <a href="https://wa.me/601120861073" style="color:#C4928A;">WhatsApp</a> 联系我们。</p>
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
      to: customerEmail,
      bcc: process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER,
      subject: `Cippy 订单 ${orderIdClean} 已发货 · Your order has shipped`,
      html,
      text: `订单 ${orderIdClean} 已发货\n快递公司: SPX Express\n运单号: ${trackingClean}\n可前往 spx.com.my 查询物流状态。`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("manual-notify error:", err);
    return res.status(500).json({ error: "邮件发送失败" });
  }
}
