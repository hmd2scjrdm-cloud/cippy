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

// The complete after-sales notice (unboxing video, 24-hour claim window, eligible / not accepted).
// Single source for every customer order email; wording matches the policies page.
export function afterSalesBlockHtml() {
  return `<div style="background:#fdf6f4;border-radius:12px;padding:20px;">
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
  </div>`;
}
