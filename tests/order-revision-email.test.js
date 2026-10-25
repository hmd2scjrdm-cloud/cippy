import test from 'node:test';
import assert from 'node:assert/strict';
import { orderRevisionEmail } from '../api/_lib/order-revision-email.js';

test('revised order groups ready stock and preorder without a new charge', () => {
  const message = orderRevisionEmail({
    order_id: '10040',
    items: [
      { name_zh: '白色上衣', size: 'M', qty: 1, price_myr: 24, preorder: false },
      { name_zh: '粉色短裙', size: 'S', qty: 2, price_myr: 30, preorder: true },
    ],
    totals: { subtotal: 84, shipping: 8, discount: 2, total: 90 },
  }, '粉色短裙改为预订');
  assert.match(message.subject, /10040/);
  assert.match(message.html, /现货 · Ready stock/);
  assert.match(message.html, /预订 · Preorder/);
  assert.match(message.html, /粉色短裙改为预订/);
  assert.match(message.html, /RM 90\.00/);
  assert.match(message.html, /not a new charge/);
  assert.match(message.text, /粉色短裙/);
});

test('customer note and item content are escaped in HTML', () => {
  const message = orderRevisionEmail({ order_id: '1', items: [{ name: '<script>alert(1)</script>', qty: 1, price_myr: 10 }], totals: { total: 10 } }, '<img src=x>');
  assert.doesNotMatch(message.html, /<script>|<img src=x>/);
  assert.match(message.html, /&lt;script&gt;/);
  assert.match(message.html, /&lt;img src=x&gt;/);
});
