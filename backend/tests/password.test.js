const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../src/utils/password');

test('hash is not the plaintext and verifies correctly', async () => {
  const hash = await hashPassword('Secret123');
  assert.ok(!hash.includes('Secret123'));
  assert.ok(await verifyPassword('Secret123', hash));
  assert.equal(await verifyPassword('Wrong123', hash), false);
});

test('same password gives different hashes (random salt)', async () => {
  assert.notEqual(await hashPassword('Secret123'), await hashPassword('Secret123'));
});

test('malformed stored hash is rejected, not thrown', async () => {
  assert.equal(await verifyPassword('x', 'garbage'), false);
  assert.equal(await verifyPassword(undefined, undefined), false);
});
