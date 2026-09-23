const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const competitionRoutes = require('./routes/competition.routes');
const registrationRoutes = require('./routes/registration.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const userRoutes = require('./routes/user.routes');
const seedRoutes = require('./routes/seed.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow all Vercel deployments + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'https://competition-detail-screen.vercel.app',
  /https:\/\/competition-detail-screen.*\.vercel\.app$/,
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(null, allowed ? origin : false);
  },
  credentials: true,
}));

// Request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seed', seedRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Feedants API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
