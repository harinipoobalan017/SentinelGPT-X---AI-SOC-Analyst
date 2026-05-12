const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

async function sendWelcomeEmail(userEmail, username) {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"SentinelGPT X" <security@sentinel.local>',
      to: userEmail,
      subject: "Welcome to SentinelGPT X Platform",
      text: `Hello ${username}, welcome to SentinelGPT X. Your SOC analyst dashboard is ready.`,
      html: `<b>Hello ${username}</b>,<br/><br/>Welcome to SentinelGPT X. Your SOC analyst dashboard is now ready for deployment.`,
    });

    console.log("[EMAIL] Welcome Message sent: %s", info.messageId);
    console.log("[EMAIL] Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("[EMAIL] Failed to send welcome email:", err);
  }
}

async function sendLoginEmail(userEmail, username) {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"SentinelGPT X" <security@sentinel.local>',
      to: userEmail,
      subject: "New Login Detected - SentinelGPT X",
      text: `Hello ${username}, a new login was detected on your SentinelGPT X account.`,
      html: `<b>Hello ${username}</b>,<br/><br/>A new login was detected on your SentinelGPT X account. If this was you, no further action is required.`,
    });

    console.log("[EMAIL] Login Notification sent: %s", info.messageId);
    console.log("[EMAIL] Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("[EMAIL] Failed to send login email:", err);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'sentinelgpt-dev-secret-change-in-prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const signToken = (userId) =>
  jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, and password required' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(409).json({ error: 'Email or username already in use' });

    const user = await User.create({ username, email, password });
    const token = signToken(user._id);
    
    // Send background welcome email
    sendWelcomeEmail(email, username);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    
    // Send background login email
    sendLoginEmail(user.email, user.username);
    
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: req.user });
};
