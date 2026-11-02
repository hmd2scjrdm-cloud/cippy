import { emailCompanyFooterHtml, DEFAULT_SITE_CONFIG } from "./site-config.js";

// Shared look for customer emails (same design as the main "your order has shipped" email):
// grey page, CIPPY wordmark, white card with a dark header, soft-pink info boxes, company footer.
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

export const money = (value) => `RM ${Number(value || 0).toFixed(2)}`;

export const labelStyle = "margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C4928A;font-weight:600;";
export const pinkBox = (inner) => `<div style="background:#fdf6f4;border-radius:12px;padding:18px 20px;margin-bottom:20px;">${inner}</div>`;

export function emailShell({ eyebrow, title, intro = "", bodyHtml, siteConfig = DEFAULT_SITE_CONFIG }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
      <tr><td style="text-align:center;padding-bottom:32px;">
        <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.2em;color:#111827;">CIPPY</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#111827;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;">${eyebrow}</p>
            <p style="margin:0 0 ${intro ? "16px" : "0"};font-size:20px;font-weight:600;color:#ffffff;letter-spacing:0.05em;">${title}</p>
            ${intro ? `<p style="margin:0;font-size:13px;color:#d1d5db;line-height:1.6;">${intro}</p>` : ""}
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:28px;">${bodyHtml}</td></tr>
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
}

// Unboxing-video + 24-hour claim notice (same wording as the main shipped email and the policies page).
export function afterSalesBlockHtml() {
  return `<div style="background:#fdf6f4;border-radius:12px;padding:20px;margin-top:8px;">
    <p style="${labelStyle}margin-bottom:4px;">售后须知 / After-Sales Notice</p>
    <p style="margin:0 0 12px;font-size:13px;color:#4b5563;line-height:1.7;">📹 拆包前请开始录制<strong>完整、不暂停、不剪辑</strong>的开箱视频，并逐件拍摄商品正面、背面和吊牌。<br/><span style="color:#9ca3af;">Record one continuous, unedited unboxing video before opening, showing the front, back and tag of every item.</span></p>
    <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.7;">⏱ 如有问题，请在<strong>收货后 24 小时内</strong>通过 <a href="https://wa.me/601120861073" style="color:#C4928A;">WhatsApp</a> 提供订单号、视频和照片。逾期或没有完整开箱视频，恕不受理。<br/><span style="color:#9ca3af;">Contact us within 24 hours of delivery with your order number, video and photos. Late requests or requests without the video cannot be accepted.</span></p>
  </div>`;
}
