const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('../src/middleware/authorize');

const run = (req) => { let err; requireAdmin(req, {}, (e) => { err = e; }); return err; };

test('no user -> 401', () => assert.equal(run({}).status, 401));
test('normal user is blocked from admin routes -> 403', () => assert.equal(run({ user: { role: 'user' } }).status, 403));
test('admin is allowed', () => assert.equal(run({ user: { role: 'admin' } }), undefined));
