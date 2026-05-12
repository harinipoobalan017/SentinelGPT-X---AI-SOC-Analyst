const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const threatRoutes = require('./routes/threats');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost origin for development, or the configured FRONTEND_URL
    if (!origin || origin.startsWith('http://localhost:') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'AI analysis rate limit exceeded. Wait 60 seconds.' }
});

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', aiLimiter, analysisRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      ai: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinelgpt')
  .then(() => {
    console.log('[DB] MongoDB connected');
    app.listen(PORT, () => {
      console.log(`[SERVER] SentinelGPT X running on port ${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection failed:', err);
    process.exit(1);
  });

module.exports = app;