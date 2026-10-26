import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingError, downloadAwb } from '../api/easyparcel.js';

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
  };
}

test('AWB download requires an existing label', async () => {
  const res = response();
  await downloadAwb({ customer: {} }, res);
  assert.equal(res.code, 404);
});

test('AWB download rejects links outside EasyParcel', async () => {
  const res = response();
  await downloadAwb({ customer: { easyparcel: { awb: '123', awb_label_url: 'https://example.com/file.pdf' } } }, res);
  assert.equal(res.code, 400);
});

test('AWB download accepts other EasyParcel subdomains', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(url.hostname, 'app.easyparcel.my');
    return new Response(Buffer.from('%PDF-1.7\nexample'), { status: 200 });
  };
  try {
    const res = response();
    await downloadAwb({ order_id: '10040', customer: { easyparcel: { awb: '123', awb_label_url: 'https://app.easyparcel.my/label.pdf' } } }, res);
    assert.equal(res.code, 200);
  } finally { globalThis.fetch = previousFetch; }
});

test('AWB download rejects lookalike domains', async () => {
  const res = response();
  await downloadAwb({ customer: { easyparcel: { awb: '123', awb_label_url: 'https://connect.easyparcel.my.evil.example/label.pdf' } } }, res);
  assert.equal(res.code, 400);
});

test('AWB download returns an attachment for a valid PDF', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url.protocol, 'https:');
    assert.equal(options.redirect, 'error');
    return new Response(Buffer.from('%PDF-1.7\nexample'), { status: 200, headers: { 'Content-Type': 'application/pdf' } });
  };
  try {
    const res = response();
    await downloadAwb({ order_id: 'CIPPY-001', customer: { easyparcel: { awb: '123', awb_label_url: 'http://connect.easyparcel.my/?ac=AWBLabel&id=abc' } } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.headers['Content-Type'], 'application/pdf');
    assert.match(res.headers['Content-Disposition'], /cippy-awb-CIPPY-001\.pdf/);
    assert.equal(res.body.toString('ascii', 0, 5), '%PDF-');
  } finally { globalThis.fetch = previousFetch; }
});

test('AWB download rejects a non-PDF response', async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('<html>error</html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
  try {
    const res = response();
    await downloadAwb({ customer: { easyparcel: { awb: '123', awb_label_url: 'https://connect.easyparcel.my/?ac=AWBLabel&id=abc' } } }, res);
    assert.equal(res.code, 502);
  } finally { globalThis.fetch = previousFetch; }
});

test('completed orders can rebook with explicit acknowledgement of the old AWB', () => {
  const order = { status: 'completed', tracking_number: 'OLD123', customer: { easyparcel: { awb: 'OLD123' } } };
  const body = { rebook: true, rebookReason: '客户地址更正', expectedAwb: 'OLD123', expectedTracking: 'OLD123', rebookAttemptId: 'ca2651f3-4f20-4400-b0ba-9e425bbbe12a' };
  assert.equal(bookingError(order, body), '');
  assert.match(bookingError(order, { ...body, expectedAwb: 'STALE' }), /已改变/);
  assert.match(bookingError(order, { ...body, rebookReason: '' }), /原因/);
  assert.match(bookingError(order, { ...body, rebookAttemptId: '' }), /请求编号/);
  assert.match(bookingError(order, { ...body, rebook: false }), /已付款/);
});

test('cancelled orders cannot rebook', () => {
  const order = { status: 'cancelled', customer: {} };
  assert.match(bookingError(order, { rebook: true }), /只有已付款/);
});
