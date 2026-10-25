const test = require('node:test');
const assert = require('node:assert/strict');
const { clean, sanitizeInput } = require('../src/utils/sanitize');

test('removes $operators and dotted keys, keeps normal data', () => {
  assert.deepEqual(clean({ email: { $gt: '' }, ok: 1, 'a.b': 2, list: [{ $ne: 1, x: 2 }] }), { email: {}, ok: 1, list: [{ x: 2 }] });
});

test('middleware cleans body and query', () => {
  const req = { body: { $where: 'x', name: 'a' }, query: { $gt: '1', search: 'pen' }, params: {} };
  let called = false;
  sanitizeInput(req, {}, () => { called = true; });
  assert.ok(called);
  assert.deepEqual(req.body, { name: 'a' });
  assert.deepEqual({ ...req.query }, { search: 'pen' });
});
