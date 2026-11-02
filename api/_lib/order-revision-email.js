import { DEFAULT_SITE_CONFIG } from "./site-config.js";
import { emailShell, escapeHtml, money, labelStyle, pinkBox } from "./email-layout.js";

export function orderRevisionEmail(order, note = '', siteConfig = DEFAULT_SITE_CONFIG) {
  const items = Array.isArray(order.items) ? order.items.filter(item => !item._is_discount) : [];
  const groups = [
    { title: '现货 · Ready stock', timing: '预计 1–3 个工作日内发货 / Expected dispatch in 1–3 working days', items: items.filter(item => !item.preorder) },
    { title: '预订 · Preorder', timing: '预计 7–21 个工作日内发货 / Expected dispatch in 7–21 working days', items: items.filter(item => item.preorder) },
  ].filter(group => group.items.length);
  const orderNo = escapeHtml(order.order_id || order.id);
  const name = escapeHtml(order.customer?.name || 'there');

  const sections = groups.map(group => `<div style="margin:0 0 20px;">
    <p style="${labelStyle}margin-bottom:2px;">${group.title}</p>
    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">${group.timing}</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${group.items.map(item => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const variant = escapeHtml([item.color, item.size, item.variant].filter(Boolean).join(' / '));
        return `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${escapeHtml(item.name_zh || item.name || 'Item')}<br><span style="font-size:12px;color:#9ca3af;">${variant ? variant + ' · ' : ''}×${qty}</span></td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;color:#111827;white-space:nowrap;">${money(Number(item.price_myr || 0) * qty)}</td>
        </tr>`;
      }).join('')}
    </table>
  </div>`).join('');

  const safeNote = escapeHtml(String(note || '').trim().slice(0, 500));
  const discount = Number(order.totals?.discount) || 0;
  const mixed = groups.length === 2;

  const bodyHtml = `
    ${safeNote ? pinkBox(`<p style="${labelStyle}">留言 / Note</p><p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap;">${safeNote}</p>`) : ''}
    ${sections}
    ${mixed ? `<p style="margin:0 0 20px;font-size:12px;color:#6b7280;line-height:1.7;">此订单包含现货与预订商品。实际寄送安排以我们后续通知为准；请勿将两段预计时间理解为已确认分开发货。<br/><span style="color:#9ca3af;">This order has both ready-stock and preorder items. We will confirm dispatch arrangements separately; these estimates do not mean two shipments are confirmed.</span></p>` : ''}
    ${pinkBox(`
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#4b5563;">
        <tr><td style="padding:3px 0;">小计 / Subtotal</td><td align="right">${money(order.totals?.subtotal)}</td></tr>
        <tr><td style="padding:3px 0;">运费 / Shipping</td><td align="right">${money(order.totals?.shipping)}</td></tr>
        ${discount > 0 ? `<tr><td style="padding:3px 0;color:#9f1239;">优惠 / Discount</td><td align="right" style="color:#9f1239;">−${money(discount)}</td></tr>` : ''}
        <tr><td style="padding:10px 0 0;font-size:16px;font-weight:700;color:#111827;">订单合计 / Order total</td><td align="right" style="padding:10px 0 0;font-size:16px;font-weight:700;color:#111827;">${money(order.totals?.total)}</td></tr>
      </table>`)}
    <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.7;">这是原订单的更新副本，不是新订单，也不会再次扣款。若金额需要调整，我们会另行联系您确认。<br/><span style="color:#9ca3af;">This is an updated copy of your original order, not a new charge. We will contact you separately about any payment adjustment.</span></p>`;

  const html = emailShell({
    eyebrow: '订单资料更新 / Order update',
    title: `订单 #${orderNo}`,
    intro: `Hi ${name}，经核对，我们已更新这笔订单的商品资料。以下是目前记录，请核对；如有疑问，直接回复此邮件。<br/><span style="color:#9ca3af;">We have updated your order details. Please review the record below and reply if anything looks incorrect.</span>`,
    bodyHtml,
    siteConfig,
  });
  const text = `CIPPY 订单 #${order.order_id || order.id} 更新 / Order update\n\n${note ? `${String(note).trim().slice(0, 500)}\n\n` : ''}${groups.map(group => `${group.title}\n${group.timing}\n${group.items.map(item => `- ${item.name_zh || item.name || 'Item'} ${[item.color, item.size, item.variant].filter(Boolean).join(' / ')} ×${item.qty || 1}: ${money(Number(item.price_myr || 0) * Number(item.qty || 1))}`).join('\n')}`).join('\n\n')}\n\n订单合计 / Order total: ${money(order.totals?.total)}\n\n这是原订单的更新副本，不会再次扣款。This is an updated copy, not a new charge.`;
  return { subject: `CIPPY 订单 #${order.order_id || order.id} 已更新 · Order update`, html, text };
}
