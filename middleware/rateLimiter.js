// middleware/rateLimiter.js — Fine-grained rate limiting per route
const rateLimit = require('express-rate-limit');

// General API limiter — 100 reqs per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Strict limiter for chat endpoints — 20 reqs per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Chat rate limit exceeded. Please wait before sending another message.' },
  skip: (req) => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => {
    // If user is authenticated, rate limit by user ID instead of IP
    return req.user?.uid || req.ip;
  },
});

module.exports = { generalLimiter, chatLimiter };
