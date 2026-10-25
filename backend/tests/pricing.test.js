const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOrder } = require('../src/utils/pricing');

const A = 'a'.repeat(24);
const B = 'b'.repeat(24);
const products = new Map([
  [A, { name: 'Pen', price: 0.1, stock: 10, image: '' }],
  [B, { name: 'Lamp', price: 27.0, stock: 2, image: 'http://x/y.png' }],
]);

test('uses database prices and totals correctly', () => {
  const r = buildOrder([{ productId: A, quantity: 3 }, { productId: B, quantity: 2 }], products);
  assert.equal(r.errors.length, 0);
  assert.equal(r.total, 54.3);
  assert.equal(r.lines[0].lineTotal, 0.3); // 0.1 * 3 must not become 0.30000000000000004
});

test('merges the same product sent twice', () => {
  const r = buildOrder([{ productId: A, quantity: 2 }, { productId: A, quantity: 3 }], products);
  assert.equal(r.lines.length, 1);
  assert.equal(r.lines[0].quantity, 5);
});

test('rejects quantity above stock', () => {
  const r = buildOrder([{ productId: B, quantity: 3 }], products);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0].message, /Only 2/);
  assert.equal(r.lines.length, 0);
});

test('rejects out-of-stock and unknown products', () => {
  const map = new Map([[A, { name: 'Pen', price: 1, stock: 0 }]]);
  const r = buildOrder([{ productId: A, quantity: 1 }, { productId: B, quantity: 1 }], map);
  assert.equal(r.errors.length, 2);
  assert.match(r.errors[0].message, /out of stock/);
  assert.match(r.errors[1].message, /not found/);
});

test('ignores any price the browser might send', () => {
  const r = buildOrder([{ productId: A, quantity: 1, price: 0.01 }], products);
  assert.equal(r.total, 0.1);
});
