import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadAwb } from './easyparcel.js';

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
