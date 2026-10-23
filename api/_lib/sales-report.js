const PAID_STATUSES = new Set(['paid', 'processing', 'shipped', 'delivered']);

export function buildSalesReport(products, orders, events, from, to) {
  const siteSessions = new Set();
  const productImpressions = new Map();
  const productViews = new Map();

  for (const event of events) {
    if (event.site_id !== 'web-1' || !event.session_id) continue;
    if (event.event_type === 'pageview') siteSessions.add(event.session_id);
    if (!['product_impression', 'product_view'].includes(event.event_type)) continue;
    const productId = String(event.path || '').replace(/^product:/, '');
    const map = event.event_type === 'product_impression' ? productImpressions : productViews;
    if (!map.has(productId)) map.set(productId, new Set());
    map.get(productId).add(event.session_id);
  }

  const rows = new Map(products.map(product => [String(product.id), {
    productId: String(product.id), sku: product.sku || '',
    name: product.name_zh || product.name || '', currentPrice: Number(product.price_myr || 0),
    currentStock: Number(product.stock || 0), orderCount: 0, unitsSold: 0, salesMyr: 0,
  }]));

  for (const order of orders) {
    if (!PAID_STATUSES.has(String(order.status || '').toLowerCase())) continue;
    const counted = new Set();
    for (const item of order.items || []) {
      if (item._is_discount) continue;
      const productId = String(item.product_id || item.baseProductId || item.id || '');
      if (!productId) continue;
      if (!rows.has(productId)) rows.set(productId, {
        productId, sku: item.sku || '', name: item.name_zh || item.name || '已删除商品',
        currentPrice: null, currentStock: null, orderCount: 0, unitsSold: 0, salesMyr: 0,
      });
      const row = rows.get(productId);
      const qty = Math.max(0, Number(item.qty || item.quantity || 0));
      row.unitsSold += qty;
      row.salesMyr += qty * Number(item.price_myr ?? item._verified_price ?? 0);
      if (!counted.has(productId)) {
        row.orderCount++;
        counted.add(productId);
      }
    }
  }

  return {
    from, to, siteSessions: siteSessions.size,
    trackingSince: '2026-10-23',
    trackingCoverage: Date.parse(from) < Date.parse('2026-10-23T00:00:00+08:00') ? 'partial' : 'full',
    rows: [...rows.values()].map(row => {
      const impressions = productImpressions.get(row.productId)?.size || 0;
      const detailSessions = productViews.get(row.productId)?.size || 0;
      return {
        ...row, salesMyr: Math.round(row.salesMyr * 100) / 100,
        impressions, detailSessions,
        exposureRate: siteSessions.size ? impressions / siteSessions.size : null,
        detailRate: impressions ? detailSessions / impressions : null,
        orderPerDetailRate: detailSessions ? row.orderCount / detailSessions : null,
      };
    }).sort((a, b) => b.salesMyr - a.salesMyr),
  };
}
