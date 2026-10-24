import test from 'node:test';
import assert from 'node:assert/strict';
import '../public/admin-order-import.js';

const parse = globalThis.parseCippyOrderText;

test('reads labeled Malaysian recipient and product details', () => {
  const result = parse('收件人：Amy Tan\n电话：012-3456789\n邮箱：amy@example.com\n地址：No. 12 Jalan Mawar, 43000 Kajang, Selangor\n商品：SKU-001 x2 / Pink / M');
  assert.equal(result.name, 'Amy Tan');
  assert.equal(result.phone, '0123456789');
  assert.equal(result.email, 'amy@example.com');
  assert.equal(result.street, 'No. 12 Jalan Mawar');
  assert.equal(result.city, 'Kajang');
  assert.equal(result.state, 'Selangor');
  assert.equal(result.postcode, '43000');
  assert.deepEqual(result.items, [{ query: 'SKU-001', qty: 2, size: 'M', color: 'Pink' }]);
});

test('reads common unlabeled chat format', () => {
  const result = parse('Amy Tan\n0123456789\nNo 12 Jalan Mawar\n43000 Kajang, Selangor');
  assert.equal(result.name, 'Amy Tan');
  assert.equal(result.phone, '0123456789');
  assert.equal(result.postcode, '43000');
  assert.equal(result.city, 'Kajang');
});

test('reads separate item options without inventing a price', () => {
  const result = parse('Name: Amy Tan\nPhone: +60 12-345 6789\nAddress: 12 Jalan Mawar, 43000 Kajang, Selangor\nSKU: SKU-001\nQuantity: 2\nColor: Pink\nSize: M');
  assert.deepEqual(result.items, [{ query: 'SKU-001', qty: 2, size: 'M', color: 'Pink' }]);
  assert.equal(result.phone, '+60123456789');
  assert.equal('price' in result.items[0], false);
});

test('flags incomplete details for manual review', () => {
  const result = parse('收件人：Amy Tan\n地址：No. 12 Jalan Mawar');
  assert.ok(result.warnings.some(warning => warning.includes('电话号码')));
  assert.ok(result.warnings.some(warning => warning.includes('邮编')));
});
