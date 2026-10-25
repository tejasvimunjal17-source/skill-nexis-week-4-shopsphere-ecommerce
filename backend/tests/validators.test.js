const test = require('node:test');
const assert = require('node:assert/strict');
const v = require('../src/utils/validators');

test('register: accepts valid input and normalises email', () => {
  const { errors, value } = v.validateRegister({ name: ' Asha ', email: ' ASHA@Example.com ', password: 'abcdefg1' });
  assert.deepEqual(errors, {});
  assert.equal(value.email, 'asha@example.com');
  assert.equal(value.name, 'Asha');
});

test('register: rejects bad name, email and weak passwords', () => {
  const r = v.validateRegister({ name: 'A', email: 'nope', password: 'short' });
  assert.ok(r.errors.name && r.errors.email && r.errors.password);
  assert.ok(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: 'onlyletters' }).errors.password);
  assert.ok(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: '12345678' }).errors.password);
});

test('register/login: non-string input (NoSQL injection attempt) is rejected', () => {
  assert.ok(v.validateLogin({ email: { $gt: '' }, password: { $gt: '' } }).errors.email);
  assert.ok(v.validateLogin({ email: { $gt: '' }, password: { $gt: '' } }).errors.password);
});

test('product: valid create passes, bad values fail', () => {
  const ok = v.validateProduct({ name: 'Mug', description: 'Nice', price: '9.99', category: 'Home', stock: '5', image: '' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.price, 9.99);
  assert.equal(ok.value.stock, 5);
  const bad = v.validateProduct({ name: 'M', description: '', price: -1, category: '', stock: 1.5, image: 'javascript:alert(1)' });
  assert.deepEqual(Object.keys(bad.errors).sort(), ['category', 'description', 'image', 'name', 'price', 'stock']);
  assert.ok(v.validateProduct({ name: 'Mug', description: 'x', price: 1.234, category: 'H', stock: 1 }).errors.price);
});

test('product: partial update only validates sent fields', () => {
  const r = v.validateProduct({ price: 12 }, { partial: true });
  assert.deepEqual(r.errors, {});
  assert.deepEqual(r.value, { price: 12 });
  assert.ok(v.validateProduct({ price: -5 }, { partial: true }).errors.price);
});

const addr = { fullName: 'A B', address: '1 Road', city: 'City', postalCode: '123', country: 'India' };

test('order: valid input passes', () => {
  const r = v.validateOrderInput({ items: [{ productId: 'a'.repeat(24), quantity: 2 }], shippingAddress: addr });
  assert.deepEqual(r.errors, {});
  assert.equal(r.value.items[0].quantity, 2);
});

test('order: rejects empty cart, bad ids, bad quantities and missing address', () => {
  assert.ok(v.validateOrderInput({ items: [], shippingAddress: addr }).errors.items);
  const r = v.validateOrderInput({
    items: [{ productId: 'bad', quantity: 1 }, { productId: 'a'.repeat(24), quantity: 0 }, { productId: 'a'.repeat(24), quantity: 1.5 }, { productId: 'a'.repeat(24), quantity: 999 }],
    shippingAddress: {},
  });
  assert.ok(r.errors['items[0].productId']);
  assert.ok(r.errors['items[1].quantity'] && r.errors['items[2].quantity'] && r.errors['items[3].quantity']);
  assert.ok(r.errors['shippingAddress.fullName']);
});
