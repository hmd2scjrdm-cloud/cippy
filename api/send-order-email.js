import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

const fmt = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });

function clean(v, fallback = "") {
  return String(v ?? fallback).replace(/[<>]/g, "").trim();
}

async function getVerifiedUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

function buildHtmlEmail({ orderId, customer, items, totals, giftNote }) {
  const itemRows = (items || []).map(item => {
    const name = clean(item.name_zh || item.name || "Item");
    const details = [item.variant, item.color, item.size].filter(Boolean).map(clean).join(" / ");
    const qty = Number(item.qty || 1);
    const price = Number(item.price_myr || 0) * qty;
    const img = item.image_url
      ? `<img src="${clean(item.image_url)}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:8px;display:block;" alt="">`
      : `<div style="width:64px;height:64px;background:#f3f4f6;border-radius:8px;"></div>`;
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="76" style="vertical-align:middle;padding-right:12px;">${img}</td>
              <td style="vertical-align:middle;">
                <p style="margin:0 0 2px;font-size:14px;font-weight:500;color:#111827;">${name}</p>
                ${details ? `<p style="margin:0 0 2px;font-size:12px;color:#9ca3af;">${details}</p>` : ""}
                <p style="margin:0;font-size:12px;color:#9ca3af;">数量: ${qty}</p>
              </td>
              <td width="80" style="vertical-align:middle;text-align:right;">
                <p style="margin:0;font-size:14px;font-weight:500;color:#111827;">${fmt.format(price)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  const subtotal = Number(totals?.subtotal || 0);
  const shipping = Number(totals?.shipping || 0);
  const total = Number(totals?.total || subtotal + shipping);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

      <tr><td style="text-align:center;padding-bottom:32px;">
        <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.2em;color:#111827;">CIPPY</p>
      </td></tr>

      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;font-size:11px;color:#6b7280;letter-spacing:0.12em;text-transform:uppercase;">Order Confirmation</p>
              <p style="margin:0 0 16px;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:0.05em;">${clean(orderId)}</p>
              <p style="margin:0;font-size:13px;color:#d1d5db;">Thank you, ${clean(customer?.name || "valued customer")}! Your order has been received and is being processed.</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:28px 28px 0;">

            <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-weight:500;">寄送至</p>
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${clean(customer?.name)}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">${clean(customer?.email)}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">${clean(customer?.phone)}</p>
            <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">${clean(customer?.address).replace(/\n/g, "<br>")}</p>

            <div style="border-top:1px solid #f3f4f6;margin-bottom:24px;"></div>

            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9ca3af;font-weight:500;">商品明细</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${itemRows}
            </table>

            <div style="border-top:1px solid #f3f4f6;margin:8px 0 16px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr>
                <td style="font-size:13px;color:#6b7280;padding:4px 0;">小计</td>
                <td style="font-size:13px;color:#6b7280;text-align:right;padding:4px 0;">${fmt.format(subtotal)}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#6b7280;padding:4px 0;">运费</td>
                <td style="font-size:13px;color:#6b7280;text-align:right;padding:4px 0;">${shipping === 0 ? "FREE" : fmt.format(shipping)}</td>
              </tr>
            </table>
            <div style="border-top:2px solid #111827;margin-bottom:12px;"></div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="font-size:16px;font-weight:700;color:#111827;">合计</td>
                <td style="font-size:16px;font-weight:700;color:#111827;text-align:right;">${fmt.format(total)}</td>
              </tr>
            </table>

            ${giftNote ? `<div style="background:#f9fafb;border-radius:10px;padding:14px 16px;margin-bottom:28px;"><p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">礼品留言</p><p style="margin:0;font-size:13px;color:#374151;">${clean(giftNote)}</p></div>` : ""}

          </td></tr>

          <tr><td style="background:#f9fafb;padding:20px 28px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">如有任何问题，请通过 Instagram 或 WhatsApp 联系我们。</p>
            <p style="margin:0;font-size:11px;color:#d1d5db;letter-spacing:0.08em;">© 2025 CIPPY · All rights reserved</p>
          </td></tr>
        </table>

      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer = {}, items = [], totals = {}, giftNote = "" } = req.body || {};
  const customerEmail = clean(customer.email).toLowerCase();

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: "邮件服务未配置，请联系客服" });
  }
  if (!customerEmail.includes("@")) {
    return res.status(400).json({ error: "Customer email is required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const user = await getVerifiedUser(req);
  if (!user) return res.status(401).json({ error: "请先登录账号" });
  if (!user.email_confirmed_at && !user.confirmed_at) return res.status(403).json({ error: "请先验证邮箱" });
  if (String(user.email || "").toLowerCase() !== customerEmail) return res.status(403).json({ error: "结账邮箱须与账号邮箱一致" });

  const orderId = `CIPPY-${Date.now().toString().slice(-8)}`;
  const html = buildHtmlEmail({ orderId, customer, items, totals, giftNote });
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `Cippy <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      bcc: notifyEmail,
      subject: `Cippy 订单确认 ${orderId}`,
      html,
      text: `订单确认 ${orderId}\n\n客户: ${clean(customer.name)}\n邮箱: ${customerEmail}\n电话: ${clean(customer.phone)}\n地址: ${clean(customer.address)}\n\n合计: ${fmt.format(Number(totals.total || 0))}\n\n感谢您在 Cippy 购物！`,
    });

    return res.status(200).json({ success: true, orderId });
  } catch (err) {
    console.error("send-order-email error:", err);
    return res.status(500).json({ error: "无法发送邮件，请联系客服" });
  }
}
