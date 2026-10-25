// Removes keys that start with "$" or contain "." so user input cannot inject MongoDB operators.
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = clean(value[key]);
    }
    return out;
  }
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    const cleaned = clean({ ...req.query });
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, cleaned);
  }
  next();
}

module.exports = { clean, sanitizeInput };
