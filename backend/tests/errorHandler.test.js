const test = require('node:test');
const assert = require('node:assert/strict');
const { errorHandler, notFound } = require('../src/middleware/errorHandler');
const ApiError = require('../src/utils/ApiError');

const fakeRes = () => ({ code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });

test('ApiError keeps status, message and details', () => {
  const res = fakeRes();
  errorHandler(new ApiError(400, 'Bad', { name: 'required' }), {}, res, () => {});
  assert.equal(res.code, 400);
  assert.deepEqual(res.body, { message: 'Bad', errors: { name: 'required' } });
});

test('duplicate key -> 409, bad id -> 400, bad JSON -> 400', () => {
  let res = fakeRes(); errorHandler({ code: 11000 }, {}, res, () => {}); assert.equal(res.code, 409);
  res = fakeRes(); errorHandler({ name: 'CastError' }, {}, res, () => {}); assert.equal(res.code, 400);
  res = fakeRes(); errorHandler({ type: 'entity.parse.failed' }, {}, res, () => {}); assert.equal(res.code, 400);
});

test('unexpected errors hide details in production', () => {
  const prev = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  const origErr = console.error; console.error = () => {};
  const res = fakeRes();
  errorHandler(new Error('db password leaked'), {}, res, () => {});
  console.error = origErr; process.env.NODE_ENV = prev;
  assert.equal(res.code, 500);
  assert.equal(res.body.message, 'Internal server error.');
});

test('notFound returns 404', () => {
  const res = fakeRes(); notFound({ method: 'GET', originalUrl: '/x' }, res); assert.equal(res.code, 404);
});
