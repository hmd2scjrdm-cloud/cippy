import test from 'node:test';
import assert from 'node:assert/strict';
import { splitStreetIntoLines } from '../src/lib/checkoutAddressImport.ts';

test('keeps a short delivery street on one line', () => {
  assert.deepEqual(splitStreetIntoLines('No. 12 Jalan Mawar'), ['No. 12 Jalan Mawar']);
});

test('splits a longer address without exceeding courier field limits', () => {
  const street = 'No. 12 Jalan Mawar, Taman Bukit Indah, Block A Unit 3';
  const lines = splitStreetIntoLines(street);
  assert.ok(lines.length <= 3);
  assert.ok(lines.every(line => line.length <= 35));
  assert.equal(lines.join(' ').replace(/[,\s]+/g, ''), street.replace(/[,\s]+/g, ''));
});

test('refuses to silently truncate an address beyond three lines', () => {
  assert.deepEqual(splitStreetIntoLines('Long street address '.repeat(12)), []);
});
