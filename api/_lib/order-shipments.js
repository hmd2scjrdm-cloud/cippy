import { DEFAULT_SITE_CONFIG } from "./site-config.js";
import { emailShell, afterSalesBlockHtml, escapeHtml, labelStyle, pinkBox } from "./email-layout.js";
import { randomUUID } from 'node:crypto';

export function shipmentProgress(order) {
  const shipments = Array.isArray(order.customer?.shipments) ? order.customer.shipments : [];
  return (Array.isArray(order.items) ? order.items : []).map((item, index) => {
    if (item._is_discount) return { index, item, ordered: 0, shipped: 0, remaining: 0 };
    const ordered = Math.max(1, Number(item.qty) || 1);
    const shipped = shipments.reduce((sum, shipment) => sum + (shipment.lines || [])
      .filter(line => line.line_id && line.line_id === item.fulfillment_line_id)
      .reduce((n, line) => n + Number(line.qty || 0), 0), 0);
    return { index, item, ordered, shipped, remaining: Math.max(0, ordered - shipped) };
  });
}

export function prepareShipment(order, input) {
  if (!['paid', 'processing'].includes(String(order.status || '').toLowerCase())) throw new Error('只有已付款或处理中的订单可以分批发货');
  const tracking = String(input.trackingNumber || '').trim();
  const courier = String(input.courier || '').trim();
  if (!tracking || tracking.length > 80) throw new Error('请填写有效运单号');
  if (!courier || courier.length > 80) throw new Error('请填写快递公司');
  if (!/^[a-f0-9-]{36}$/i.test(String(input.requestId || ''))) throw new Error('发货请求无效，请重新打开窗口');
  if (!Array.isArray(input.lines) || !input.lines.length) throw new Error('请至少选择一件商品');
  const existing = Array.isArray(order.customer?.shipments) ? order.customer.shipments : [];
  if (existing.some(shipment => shipment.id === input.requestId)) throw new Error('这批包裹已经记录，请刷新订单');
  if (existing.some(shipment => shipment.tracking_number === tracking)) throw new Error('这个运单号已经用于本订单，请检查是否重复发货');

  const items = (order.items || []).map(item => ({ ...item, fulfillment_line_id: item.fulfillment_line_id || randomUUID() }));
  const progress = shipmentProgress({ ...order, items });
  const picked = new Set();
  const lines = input.lines.map(line => {
    const index = Number(line.index);
    const qty = Number(line.qty);
    const row = progress[index];
    if (!Number.isInteger(index) || !row || picked.has(index)) throw new Error('商品行已改变，请刷新订单');
    if (row.item._is_discount) throw new Error('优惠项目不能作为包裹商品');
    picked.add(index);
    if (String(line.expectedName || '') !== String(row.item.name_zh || row.item.name || '') || Number(line.expectedQty) !== row.ordered || String(line.expectedSize || '') !== String(row.item.size || '') || String(line.expectedColor || '') !== String(row.item.color || '')) {
      throw new Error('订单商品已改变，请刷新后重新选择');
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > row.remaining) throw new Error(`商品 ${row.item.name_zh || row.item.name || index + 1} 的出货数量超过未寄数量`);
    return { line_id: row.item.fulfillment_line_id, qty };
  });
  const shipment = {
    id: input.requestId, created_at: new Date().toISOString(), tracking_number: tracking,
    courier, photo_url: String(input.photoUrl || '').slice(0, 1000), lines,
  };
  const shipments = [...existing, shipment];
  const after = shipmentProgress({ ...order, items, customer: { ...(order.customer || {}), shipments } });
  return { items, shipment, shipments, remaining: after.reduce((sum, row) => sum + row.remaining, 0), allShipped: after.every(row => row.remaining === 0) };
}

export function shipmentEmail(order, shipment, remaining, siteConfig = DEFAULT_SITE_CONFIG) {
  const products = (shipment.lines || []).map(line => {
    const item = (order.items || []).find(row => row.fulfillment_line_id === line.line_id);
    return item ? { name: item.name_zh || item.name || 'Item', size: item.size, color: item.color, qty: line.qty } : null;
  }).filter(Boolean);
  const partial = remaining > 0;
  const orderNo = escapeHtml(order.order_id || order.id);
  const name = escapeHtml(order.customer?.name || 'there');
  const courier = escapeHtml(shipment.courier);
  const tracking = escapeHtml(shipment.tracking_number);
  const isSpx = /spx/i.test(String(shipment.courier || ''));

  const itemRows = products.map(item => {
    const variant = escapeHtml([item.color, item.size].filter(Boolean).join(' / '));
    return `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;">${escapeHtml(item.name)}${variant ? `<br><span style="font-size:12px;color:#9ca3af;">${variant}</span>` : ''}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#4b5563;white-space:nowrap;">×${item.qty}</td></tr>`;
  }).join('');

  const bodyHtml = `
    ${pinkBox(`<p style="${labelStyle}">快递公司 / Courier</p><p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">${courier}</p><p style="${labelStyle}">运单号 / Tracking Number</p><p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;letter-spacing:0.03em;">${tracking}</p>`)}
    ${isSpx ? `<p style="margin:0 0 20px;font-size:13px;color:#6b7280;line-height:1.6;">您可以前往 <a href="https://spx.com.my" style="color:#C4928A;">spx.com.my</a> 官网，输入以上运单号查询实时物流状态。<br/>You can track your parcel in real time at <a href="https://spx.com.my" style="color:#C4928A;">spx.com.my</a>.</p>` : ''}
    <p style="${labelStyle}margin-bottom:2px;">本次包裹内容 / In this parcel</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">${itemRows}</table>
    ${partial ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:20px;"><p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">还有 <strong>${remaining}</strong> 件商品尚未寄出，之后会另外通知您。<br/><span style="color:#b45309;">${remaining} item(s) remain and will be dispatched separately.</span></p></div>` : ''}
    ${shipment.photo_url ? `<p style="${labelStyle}">打包实拍 / Packing Photo</p><img src="${escapeHtml(shipment.photo_url)}" width="100%" style="border-radius:10px;display:block;margin-bottom:20px;max-height:320px;object-fit:cover;" alt="Packing photo"/>` : ''}
    ${afterSalesBlockHtml()}`;

  const html = emailShell({
    eyebrow: partial ? 'Part of your order has shipped' : 'Your order has shipped',
    title: orderNo,
    intro: `Hi ${name}，${partial ? '你订单里的一部分商品已经寄出啦' : '你的 Cippy 订单已经寄出啦'}！🎉`,
    bodyHtml,
    siteConfig,
  });
  const text = `CIPPY 订单 #${order.order_id || order.id} ${partial ? '部分发货 / Partially shipped' : '已发货 / Shipped'}\n\n本次包裹 / This parcel:\n${products.map(item => `- ${item.name} ${[item.color, item.size].filter(Boolean).join(' / ')} ×${item.qty}`).join('\n')}\n\n快递 / Courier: ${shipment.courier}\n运单号 / Tracking: ${shipment.tracking_number}${partial ? `\n\n还有 ${remaining} 件商品尚未寄出。${remaining} item(s) remain.` : ''}\n\n拆包前请录制完整开箱视频，收货后 24 小时内如有问题请联系我们。Record an unedited unboxing video before opening; contact us within 24 hours of delivery if there is a problem.`;
  return { subject: `CIPPY 订单 #${order.order_id || order.id} ${partial ? '部分发货' : '已发货'} · ${partial ? 'Partially shipped' : 'Shipped'}`, html, text };
}

