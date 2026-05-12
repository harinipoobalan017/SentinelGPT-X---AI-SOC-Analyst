const express = require('express');
const router = express.Router();
const analysisCtrl = require('../controllers/analysisCtrl');
const authMiddleware = require('../middleware/auth');

// Optional auth — works in demo mode without token too
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    const JWT_SECRET = process.env.JWT_SECRET || 'sentinelgpt-dev-secret-change-in-prod';
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.sub);
    next();
  } catch {
    next();
  }
};

router.post('/analyze',  optionalAuth, analysisCtrl.analyze);
router.get('/reports',   authMiddleware, analysisCtrl.getReports);

module.exports = router;
