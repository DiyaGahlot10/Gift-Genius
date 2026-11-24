const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

const COOKIE_NAME = 'token';

// Converts values like "7d", "12h", "30m" to milliseconds (default 7 days).
const durationToMs = (value = '7d') => {
  const m = /^(\d+)\s*([smhd])$/.exec(String(value).trim());
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60 * 1000, h: 3600 * 1000, d: 86400 * 1000 }[m[2]];
  return n * unit;
};

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'Server is not configured: JWT_SECRET is missing');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const cookieOptions = () => ({
  httpOnly: true, // not readable from JavaScript, which protects against XSS token theft
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: durationToMs(process.env.JWT_EXPIRES_IN),
  path: '/',
});

const setAuthCookie = (res, userId) => {
  res.cookie(COOKIE_NAME, signToken(userId), cookieOptions());
};

const clearAuthCookie = (res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
};

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
