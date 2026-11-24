require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Hosts like Render sit behind a proxy; this makes rate limiting and secure cookies see the real client.
if (isProd) app.set('trust proxy', 1);

// ---- Core middleware ----
// The default helmet policy would block Google Fonts and the product photos, so allow just those.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ---- Routes ----
// Health check: reports API status and database connection state.
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'unknown';
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: dbState,
      time: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));

// ---- Frontend (production) ----
// After `npm run build` in client/, Express serves the React app from client/dist,
// so the site and the API share one address (no CORS issues, cookies just work).
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (isProd && fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { maxAge: '1h' }));
  // Any non-API URL (e.g. /shop, /product/123 on refresh) gets the React app.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ---- Errors (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('Warning: JWT_SECRET is not set. Auth will not work until you set it in .env.');
    }
    await connectDB();
    app.listen(PORT, () => console.log(`GiftGenius running on port ${PORT} (${isProd ? 'production' : 'development'})`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

module.exports = app;
