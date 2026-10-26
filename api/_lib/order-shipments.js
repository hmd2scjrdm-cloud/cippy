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

export function shipmentEmail(order, shipment, remaining) {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const products = (shipment.lines || []).map(line => {
    const item = (order.items || []).find(row => row.fulfillment_line_id === line.line_id);
    return item ? { name: item.name_zh || item.name || 'Item', size: item.size, color: item.color, qty: line.qty } : null;
  }).filter(Boolean);
  const listHtml = products.map(item => `<li>${escape(item.name)} · ${escape([item.color, item.size].filter(Boolean).join(' / '))} ×${item.qty}</li>`).join('');
  const partial = remaining > 0;
  const html = `<div style="max-width:560px;margin:auto;font-family:Arial,sans-serif;color:#332928;line-height:1.6"><h1>CIPPY</h1><h2>订单 #${escape(order.order_id || order.id)} ${partial ? '部分发货 / Partially shipped' : '已发货 / Shipped'}</h2><p>这次包裹包含以下商品。<br>This parcel contains the following items:</p><ul>${listHtml}</ul><p><strong>快递 / Courier:</strong> ${escape(shipment.courier)}<br><strong>运单号 / Tracking:</strong> ${escape(shipment.tracking_number)}</p>${shipment.photo_url ? `<img src="${escape(shipment.photo_url)}" alt="Packing photo" style="max-width:100%;max-height:320px;object-fit:cover">` : ''}${partial ? `<p>还有 ${remaining} 件商品尚未寄出，之后会另外通知您。<br>${remaining} item(s) remain and will be dispatched separately.</p>` : ''}<p>拆包前请录制完整、未剪辑的开箱视频。<br>Please record one continuous, unedited unboxing video before opening the parcel.</p></div>`;
  const text = `CIPPY 订单 #${order.order_id || order.id} ${partial ? '部分发货 / Partially shipped' : '已发货 / Shipped'}\n\n本次包裹 / This parcel:\n${products.map(item => `- ${item.name} ${[item.color, item.size].filter(Boolean).join(' / ')} ×${item.qty}`).join('\n')}\n\n快递 / Courier: ${shipment.courier}\n运单号 / Tracking: ${shipment.tracking_number}${partial ? `\n\n还有 ${remaining} 件商品尚未寄出。${remaining} item(s) remain.` : ''}\n\n拆包前请录制完整开箱视频。Record an unedited unboxing video before opening.`;
  return { subject: `CIPPY 订单 #${order.order_id || order.id} ${partial ? '部分发货' : '已发货'} · ${partial ? 'Partially shipped' : 'Shipped'}`, html, text };
}
