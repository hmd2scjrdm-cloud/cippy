import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareShipment, shipmentProgress, shipmentEmail } from '../api/_lib/order-shipments.js';

const order = () => ({
  id: 'db-id', order_id: '10042', status: 'paid',
  customer: {},
  items: [
    { name: 'Top', name_zh: '上衣', color: 'Pink', size: 'S', qty: 2 },
    { name: 'Skirt', name_zh: '半身裙', color: 'Black', size: 'M', qty: 1 },
    { name: 'Discount', qty: 1, _is_discount: true },
  ],
});

const request = (id, tracking, lines) => ({
  requestId: id, trackingNumber: tracking, courier: 'SPX', lines,
});
const top = qty => ({ index: 0, qty, expectedName: '上衣', expectedQty: 2, expectedSize: 'S', expectedColor: 'Pink' });
const skirt = qty => ({ index: 1, qty, expectedName: '半身裙', expectedQty: 1, expectedSize: 'M', expectedColor: 'Black' });

test('one order ships in two parcels without a new order or extra item', () => {
  const first = prepareShipment(order(), request('11111111-1111-4111-8111-111111111111', 'SPX-1', [top(1)]));
  assert.equal(first.remaining, 2);
  assert.equal(first.allShipped, false);
  const partly = { ...order(), status: 'processing', items: first.items, customer: { shipments: first.shipments } };
  assert.deepEqual(shipmentProgress(partly).map(row => row.remaining), [1, 1, 0]);
  const second = prepareShipment(partly, request('22222222-2222-4222-8222-222222222222', 'SPX-2', [top(1), skirt(1)]));
  assert.equal(second.remaining, 0);
  assert.equal(second.allShipped, true);
  assert.equal(second.shipments.length, 2);
  assert.equal(second.shipments[0].tracking_number, 'SPX-1');
  assert.equal(second.shipments[1].tracking_number, 'SPX-2');
  assert.match(shipmentEmail({ ...partly, items: second.items }, second.shipment, 0).subject, /Shipped/);
});

test('rejects duplicate parcel, over-shipment, stale item and discount row', () => {
  const first = prepareShipment(order(), request('11111111-1111-4111-8111-111111111111', 'SPX-1', [top(2)]));
  const partly = { ...order(), status: 'processing', items: first.items, customer: { shipments: first.shipments } };
  assert.throws(() => prepareShipment(partly, request('11111111-1111-4111-8111-111111111111', 'SPX-2', [skirt(1)])), /已经记录/);
  assert.throws(() => prepareShipment(partly, request('22222222-2222-4222-8222-222222222222', 'SPX-1', [skirt(1)])), /已经用于/);
  assert.throws(() => prepareShipment(partly, request('22222222-2222-4222-8222-222222222222', 'SPX-2', [top(1)])), /超过未寄/);
  assert.throws(() => prepareShipment(partly, request('22222222-2222-4222-8222-222222222222', 'SPX-2', [{ ...skirt(1), expectedColor: 'White' }])), /已改变/);
  assert.throws(() => prepareShipment(partly, request('22222222-2222-4222-8222-222222222222', 'SPX-2', [{ index: 2, qty: 1, expectedName: 'Discount', expectedQty: 0 }])), /优惠项目/);
});
