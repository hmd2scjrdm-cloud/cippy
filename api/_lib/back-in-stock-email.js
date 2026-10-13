import { emailCompanyFooterHtml } from "./site-config.js";

const esc = (v) => String(v ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
const SHOP_URL = "https://cippy.vercel.app";
const NO_COLOR = "图片色";

// One email per customer, listing everything they were waiting for that is now back.
// items: [{ name, nameZh, imageUrl, color, size }]
export function backInStockEmail(items, siteConfig) {
  const rows = items.map((it) => {
    const variant = [it.color && it.color !== NO_COLOR ? it.color : "", it.size].filter(Boolean).map(esc).join(" / ");
    return `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${it.imageUrl ? `<td width="64" style="padding-right:14px;"><img src="${esc(it.imageUrl)}" width="64" style="border-radius:8px;display:block;" alt=""/></td>` : ""}
        <td>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${esc(it.name)}</p>
          ${it.nameZh && it.nameZh !== it.name ? `<p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${esc(it.nameZh)}</p>` : ""}
          ${variant ? `<p style="margin:4px 0 0;font-size:12px;color:#C4928A;font-weight:600;">${variant}</p>` : ""}
        </td>
      </tr></table></td></tr>`;
  }).join("");
  const many = items.length > 1;
  const subject = many
    ? "Cippy · 你等的款式到货了 · Your pieces are back in stock"
    : `Cippy · ${items[0].nameZh || items[0].name} 到货了 · Back in stock`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 16px;"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
    <tr><td style="text-align:center;padding-bottom:28px;"><p style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.2em;color:#111827;">CIPPY</p></td></tr>
    <tr><td style="background:#ffffff;border-radius:16px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C4928A;font-weight:600;">Back in stock · 到货提醒</p>
      <p style="margin:0 0 18px;font-size:15px;color:#111827;line-height:1.6;">${many ? "你等的这几件现在有现货了" : "你等的这件现在有现货了"}。数量有限，先到先得。<br/><span style="color:#6b7280;font-size:13px;">${many ? "These pieces you asked about are back in stock." : "A piece you asked about is back in stock."} Quantities are limited.</span></p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
      <p style="margin:24px 0 0;text-align:center;"><a href="${SHOP_URL}" style="display:inline-block;background:#3F2B2B;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:8px;">去选购 / Shop now</a></p>
      <p style="margin:18px 0 0;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">你收到这封邮件，是因为你在网站上点了「到货通知我」。这是一次性提醒，不会再发送。<br/>You asked us to let you know — this is a one-time email.</p>
    </td></tr>
    <tr><td style="text-align:center;padding-top:20px;">${emailCompanyFooterHtml(siteConfig, "#9ca3af")}
      <p style="margin:0;font-size:11px;color:#d1d5db;letter-spacing:0.08em;">© 2026 CIPPY · All rights reserved</p></td></tr>
  </table></td></tr></table></body></html>`;
  const text = `${subject}\n\n` + items.map((it) => `- ${it.nameZh || it.name} ${[it.color !== NO_COLOR ? it.color : "", it.size].filter(Boolean).join(" / ")}`).join("\n") + `\n\n${SHOP_URL}`;
  return { subject, html, text };
}
