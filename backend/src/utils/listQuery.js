// Safely reads the product list query string (?search=&category=&sort=&page=&limit=).
const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  name: { name: 1, _id: 1 },
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const asText = (v) => (typeof v === 'string' ? v.trim() : '');

function parseListQuery(query = {}) {
  const sortKey = typeof query.sort === 'string' && Object.hasOwn(SORTS, query.sort) ? query.sort : 'newest';
  return {
    page: Math.max(parseInt(query.page, 10) || 1, 1),
    limit: Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50),
    search: asText(query.search).slice(0, 80),
    category: asText(query.category).slice(0, 50),
    sortKey,
    sort: SORTS[sortKey],
  };
}

module.exports = { parseListQuery, escapeRegex, SORTS };
