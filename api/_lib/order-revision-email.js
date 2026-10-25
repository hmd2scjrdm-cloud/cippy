function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

const money = value => `RM ${Number(value || 0).toFixed(2)}`;

export function orderRevisionEmail(order, note = '') {
  const items = Array.isArray(order.items) ? order.items.filter(item => !item._is_discount) : [];
  const groups = [
    { title: '现货 · Ready stock', timing: '预计 1–3 个工作日内发货 / Expected dispatch in 1–3 working days', items: items.filter(item => !item.preorder) },
    { title: '预订 · Preorder', timing: '预计 7–21 个工作日内发货 / Expected dispatch in 7–21 working days', items: items.filter(item => item.preorder) },
  ].filter(group => group.items.length);
  const sections = groups.map(group => `<section style="margin:20px 0;border-top:1px solid #eadfda;padding-top:14px">
    <h2 style="font-size:16px;color:#3f2b2b;margin:0 0 4px">${group.title}</h2>
    <p style="font-size:12px;color:#776b68;margin:0 0 12px">${group.timing}</p>
    ${group.items.map(item => `<div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #f2ece9;font-size:13px">
      <span>${escapeHtml(item.name_zh || item.name || 'Item')}<br><small style="color:#776b68">${escapeHtml([item.color, item.size, item.variant].filter(Boolean).join(' / '))} · ×${Math.max(1, Number(item.qty) || 1)}</small></span>
      <strong style="white-space:nowrap">${money(Number(item.price_myr || 0) * Math.max(1, Number(item.qty) || 1))}</strong>
    </div>`).join('')}
  </section>`).join('');
  const safeNote = escapeHtml(String(note || '').trim().slice(0, 500));
  const mixed = groups.length === 2;
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f8f3f0;font-family:Arial,'Microsoft YaHei',sans-serif;color:#332928">
    <div style="max-width:560px;margin:24px auto;background:#fff;padding:28px">
      <h1 style="font-size:25px;letter-spacing:3px;margin:0 0 18px">CIPPY</h1>
      <p style="font-size:12px;color:#8a7b76">订单资料更新 / Order update</p>
      <h2 style="font-size:20px;margin:0 0 14px">订单 #${escapeHtml(order.order_id || order.id)}</h2>
      <p style="font-size:13px;line-height:1.7">经核对，我们已更新这笔订单的商品资料。以下是目前记录，请核对；如有疑问，直接回复此邮件。<br>We have updated your order details. Please review the current record below and reply to this email if anything looks incorrect.</p>
      ${safeNote ? `<p style="background:#f8f3f0;padding:12px;font-size:13px;line-height:1.7;white-space:pre-wrap">${safeNote}</p>` : ''}
      ${sections}
      ${mixed ? '<p style="font-size:12px;color:#776b68;line-height:1.6">此订单包含现货与预订商品。实际寄送安排以我们后续通知为准；请勿将两段预计时间理解为已确认分开发货。<br>This order has both ready-stock and preorder items. We will confirm dispatch arrangements separately; these estimates do not mean two shipments are confirmed.</p>' : ''}
      <p style="border-top:1px solid #eadfda;padding-top:14px;font-size:13px">小计 / Subtotal: ${money(order.totals?.subtotal)}<br>运费 / Shipping: ${money(order.totals?.shipping)}<br>优惠 / Discount: −${money(order.totals?.discount)}<br><strong>订单合计 / Order total: ${money(order.totals?.total)}</strong></p>
      <p style="font-size:12px;color:#776b68;line-height:1.6">这是原订单的更新副本，不是新订单，也不会再次扣款。若金额需要调整，我们会另行联系您确认。<br>This is an updated copy of your original order, not a new charge. We will contact you separately about any payment adjustment.</p>
    </div></body></html>`;
  const text = `CIPPY 订单 #${order.order_id || order.id} 更新 / Order update\n\n${note ? `${String(note).trim().slice(0, 500)}\n\n` : ''}${groups.map(group => `${group.title}\n${group.timing}\n${group.items.map(item => `- ${item.name_zh || item.name || 'Item'} ${[item.color, item.size, item.variant].filter(Boolean).join(' / ')} ×${item.qty || 1}: ${money(Number(item.price_myr || 0) * Number(item.qty || 1))}`).join('\n')}`).join('\n\n')}\n\n订单合计 / Order total: ${money(order.totals?.total)}\n\n这是原订单的更新副本，不会再次扣款。This is an updated copy, not a new charge.`;
  return { subject: `CIPPY 订单 #${order.order_id || order.id} 已更新 · Order update`, html, text };
}
