import test from 'node:test';
import assert from 'node:assert/strict';
import { addItem, setQuantity, removeItem, cartTotals, lineTotal, clampQuantity, parseSavedCart, MAX_QTY } from '../src/utils/cartMath.js';

const pen = { _id: 'p1', name: 'Pen', price: 0.1, stock: 5, image: '' };
const lamp = { _id: 'p2', name: 'Lamp', price: 27, stock: 2 };

test('add new item and increase existing one', () => {
  let cart = addItem([], pen);
  assert.equal(cart[0].quantity, 1);
  cart = addItem(cart, pen, 2);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 3);
});

test('quantity never goes above stock or the maximum', () => {
  let cart = addItem([], lamp, 10);
  assert.equal(cart[0].quantity, 2);
  cart = addItem(cart, lamp, 5);
  assert.equal(cart[0].quantity, 2);
  assert.equal(clampQuantity(500, 1000), MAX_QTY);
  assert.equal(clampQuantity('abc', 5), 1);
});

test('out-of-stock products cannot be added', () => {
  assert.deepEqual(addItem([], { ...pen, stock: 0 }), []);
});

test('decrease to zero removes the item; remove works', () => {
  let cart = addItem(addItem([], pen), lamp);
  cart = setQuantity(cart, 'p1', 0);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].productId, 'p2');
  assert.deepEqual(removeItem(cart, 'p2'), []);
});

test('totals are exact (no floating point errors)', () => {
  let cart = addItem([], pen, 3);
  cart = addItem(cart, lamp, 2);
  assert.equal(lineTotal(cart[0]), 0.3);
  assert.deepEqual(cartTotals(cart), { itemCount: 5, subtotal: 54.3 });
  assert.deepEqual(cartTotals([]), { itemCount: 0, subtotal: 0 });
});

test('saved cart parsing ignores corrupt data', () => {
  assert.deepEqual(parseSavedCart('not json'), []);
  assert.deepEqual(parseSavedCart('{"a":1}'), []);
  assert.equal(parseSavedCart(JSON.stringify([{ productId: 'x', name: 'N', price: 1, quantity: 2 }, { bad: true }])).length, 1);
});
