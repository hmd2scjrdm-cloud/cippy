import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSalesReport } from './sales-report.js';

test('SKU report excludes unpaid orders and counts unique exposure sessions', () => {
  const productId = '11111111-1111-4111-8111-111111111111';
  const products = [{ id: productId, sku: 'CIP-001', name_zh: '圆领 T', price_myr: 49, stock: 3 }];
  const item = { product_id: productId, qty: 2, price_myr: 49 };
  const orders = [
    { status: 'paid', items: [item] },
    { status: 'pending_payment', items: [item] },
  ];
  const events = [
    { site_id: 'web-1', event_type: 'pageview', session_id: 'a' },
    { site_id: 'web-1', event_type: 'pageview', session_id: 'b' },
    { site_id: 'web-1', event_type: 'product_impression', path: `product:${productId}`, session_id: 'a' },
    { site_id: 'web-1', event_type: 'product_impression', path: `product:${productId}`, session_id: 'a' },
    { site_id: 'web-1', event_type: 'product_view', path: `product:${productId}`, session_id: 'a' },
  ];
  const report = buildSalesReport(products, orders, events, '2026-10-23T00:00:00+08:00', '2026-10-24T00:00:00+08:00');
  assert.equal(report.siteSessions, 2);
  assert.equal(report.rows[0].unitsSold, 2);
  assert.equal(report.rows[0].salesMyr, 98);
  assert.equal(report.rows[0].orderCount, 1);
  assert.equal(report.rows[0].impressions, 1);
  assert.equal(report.rows[0].detailSessions, 1);
  assert.equal(report.rows[0].exposureRate, 0.5);
  assert.equal(report.rows[0].orderPerDetailRate, 1);
});

test('sales from deleted products remain in the export', () => {
  const report = buildSalesReport([], [{ status: 'shipped', items: [
    { product_id: 'old-product', name_zh: '旧款上衣', qty: 1, price_myr: 35 },
  ] }], [], '2026-10-23T00:00:00+08:00', '2026-10-24T00:00:00+08:00');
  assert.equal(report.rows[0].salesMyr, 35);
  assert.equal(report.rows[0].name, '旧款上衣');
  assert.equal(report.rows[0].currentPrice, null);
});
