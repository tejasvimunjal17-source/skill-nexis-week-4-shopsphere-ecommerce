const test = require('node:test');
const assert = require('node:assert/strict');
const { parseListQuery, escapeRegex } = require('../src/utils/listQuery');

test('defaults and limits', () => {
  const q = parseListQuery({});
  assert.deepEqual([q.page, q.limit, q.sortKey], [1, 12, 'newest']);
  assert.equal(parseListQuery({ page: '-4', limit: '9999' }).page, 1);
  assert.equal(parseListQuery({ limit: '9999' }).limit, 50);
});

test('unknown or tricky sort values fall back to newest', () => {
  for (const sort of ['constructor', '__proto__', 'toString', ['price_asc'], { a: 1 }, 'bogus']) {
    assert.equal(parseListQuery({ sort }).sortKey, 'newest', String(sort));
  }
  assert.equal(parseListQuery({ sort: 'price_desc' }).sortKey, 'price_desc');
});

test('non-string search/category are ignored; regex characters are escaped', () => {
  const q = parseListQuery({ search: { $ne: 1 }, category: ['a'] });
  assert.equal(q.search, '');
  assert.equal(q.category, '');
  assert.equal(escapeRegex('a.b*(c)'), 'a\\.b\\*\\(c\\)');
  assert.ok(new RegExp(escapeRegex('(x+')).test('(x+'));
});
