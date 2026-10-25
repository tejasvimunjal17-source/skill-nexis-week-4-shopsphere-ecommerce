const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// One place that turns every error into a consistent JSON response.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';
  let details = err.details;

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id format.';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Validation failed.';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  }

  if (status >= 500) {
    console.error(err);
    message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : message;
    details = undefined;
  }

  const body = { message };
  if (details) body.errors = details;
  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
