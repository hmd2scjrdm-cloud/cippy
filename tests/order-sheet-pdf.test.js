import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderOrderSheetPdf } from '../api/_lib/order-sheet-pdf.js';
import handler from '../api/order-sheet-pdf.js';

test('order sheet is a PDF with Chinese and 4x6 pages', async () => {
  const font = await readFile(new URL('../assets/NotoSansCJKsc-Regular.otf', import.meta.url));
  const order = {
    id: 'test-order', order_id: '10041', created_at: '2026-10-26T03:58:00Z', status: 'processing', payment_method: 'duitnow',
    customer: { name: '测试顾客', phone: '0120000000', email: 'test@example.com', address1: '测试用途，Jalan Contoh 1', postcode: '50000', city: 'Kuala Lumpur', state: 'Wilayah Persekutuan', easyparcel: { courier: 'SPX' } },
    tracking_number: 'SPX12345',
    items: Array.from({ length: 12 }, (_, index) => ({ name_zh: `韩系长款商品 ${index + 1}`, size: 'M', color: '黑色', qty: 1, price_myr: 15, preorder: index > 7 })),
    totals: { subtotal: 180, shipping: 0, discount: 10, total: 170 },
  };
  const pdf = await renderOrderSheetPdf(order, font);
  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.ok(pdf.length > 2000);
  assert.match(pdf.toString('latin1'), /\/MediaBox \[0 0 288 432\]/);
});

test('admin order download responds with a PDF attachment', async () => {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  globalThis.fetch = async url => {
    if (String(url).includes('/auth/v1/user')) return new Response(JSON.stringify({ email: 'cippy.kl@gmail.com' }), { status: 200 });
    if (String(url).includes('/rest/v1/orders')) return new Response(JSON.stringify([{ id: 'order_1', order_id: '10041', status: 'paid', customer: { name: '测试顾客' }, items: [], totals: { total: 0 } }]), { status: 200 });
    throw new Error(`Unexpected request: ${url}`);
  };
  const res = {
    statusCode: 200, headers: {}, body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
  try {
    await handler({ method: 'POST', headers: { authorization: 'Bearer admin-token' }, body: { orderId: 'order_1' } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'application/pdf');
    assert.match(res.headers['Content-Disposition'], /cippy-order-10041-4x6\.pdf/);
    assert.equal(res.body.subarray(0, 5).toString('ascii'), '%PDF-');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});
