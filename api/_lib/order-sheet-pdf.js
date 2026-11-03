import PDFDocument from 'pdfkit';

const PAGE_WIDTH = 288;
const PAGE_HEIGHT = 432;
const LEFT = 16;
const RIGHT = PAGE_WIDTH - LEFT;

const value = input => String(input ?? '').trim();
const money = input => `RM ${Number(input || 0).toFixed(2)}`;

export async function renderOrderSheetPdf(order, fontBuffer) {
  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margins: { top: 16, bottom: 16, left: LEFT, right: LEFT }, compress: true });
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.font(fontBuffer);

  function rule() {
    doc.moveDown(0.35);
    doc.strokeColor('#ded8d5').lineWidth(0.6).moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke();
    doc.moveDown(0.4);
  }
  function ensure(height) {
    if (doc.y + height > PAGE_HEIGHT - 18) doc.addPage();
  }
  function text(line, size = 8, color = '#322a29') {
    doc.font(fontBuffer).fontSize(size).fillColor(color).text(value(line) || '-', LEFT, doc.y, { width: RIGHT - LEFT, lineGap: 1 });
  }

  const customer = order.customer || {};
  const address = [customer.address1, customer.address2, customer.address3, customer.postcode, customer.city, customer.state]
    .map(value).filter(Boolean).join(', ') || value(customer.address);
  const orderedAt = order.created_at && !Number.isNaN(Date.parse(order.created_at))
    ? new Date(order.created_at).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) : '-';

  text('CIPPY', 18);
  text('订单单据 / Order sheet', 8, '#777777');
  doc.moveDown(0.3);
  text(`#${value(order.order_id || order.id)}  |  ${orderedAt}`, 8);
  text(`状态 / Status: ${value(order.status) || '-'}`, 8);
  rule();

  text('收件人 / Recipient', 10);
  text(value(customer.name) || '-', 9);
  text(value(customer.phone) || '-', 8);
  text(value(customer.email || order.guest_email) || '-', 8);
  text(address || '-', 8);
  rule();

  text('配送 / Shipping', 10);
  text(`快递 / Courier: ${value(customer.easyparcel?.courier) || '-'}`);
  text(`运单号 / Tracking: ${value(order.tracking_number) || '-'}`);
  text(`付款 / Payment: ${value(order.payment_method) || '-'}`);
  rule();

  text('商品 / Items', 10);
  let itemNo = 0;
  for (const [preorder, label] of [[false, '现货 / Ready stock'], [true, '预订 / Preorder']]) {
    const items = (Array.isArray(order.items) ? order.items : []).filter(item => Boolean(item.preorder) === preorder && !item._is_discount);
    if (!items.length) continue;
    ensure(28);
    doc.moveDown(0.2);
    text(label, 8, '#ae746d');
    for (const item of items) {
      ensure(48);
      itemNo += 1;
      const qty = Number(item.qty || 1);
      text(`${itemNo}. ${value(item.name_zh || item.name) || 'Item'}`, 8);
      const variant = [item.size, item.color, item.variant].map(value).filter(Boolean).join(' / ');
      if (variant) text(variant, 7, '#777777');
      if (item.sku) text(`SKU: ${value(item.sku)}`, 7, '#777777');
      text(`${qty} x ${money(item.price_myr)} = ${money(Number(item.price_myr || 0) * qty)}`, 8);
      doc.moveDown(0.3);
    }
  }
  if (!itemNo) text('暂无商品资料 / No items');
  ensure(75);
  rule();
  text(`小计 / Subtotal: ${money(order.totals?.subtotal)}`);
  text(`运费 / Shipping: ${money(order.totals?.shipping)}`);
  if (Number(order.totals?.discount) > 0) text(`优惠 / Discount: -${money(order.totals.discount)}`);
  text(`合计 / Total: ${money(order.totals?.total ?? order.total_amount)}`, 10);
  doc.moveDown(0.6);
  text('CIPPY · 内部订单与配货记录 / Internal order and packing record', 7, '#777777');

  doc.end();
  return finished;
}
