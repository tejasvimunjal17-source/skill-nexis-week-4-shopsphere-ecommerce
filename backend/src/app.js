const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { sanitizeInput } = require('./utils/sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

function createApp({ clientUrls }) {
  const app = express();
  app.set('trust proxy', 1); // Render runs behind a proxy

  // The frontend lives on a different address, so allow cross-origin reads of API responses.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      // Only the listed website addresses may call the API from a browser.
      origin(origin, callback) {
        if (!origin || clientUrls.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
    })
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(sanitizeInput);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in a few minutes.' },
  });
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
