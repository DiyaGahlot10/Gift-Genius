const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../utils/token');

const readToken = (req) => {
  if (req.cookies && req.cookies[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  // Bearer header fallback is handy for Postman/curl testing.
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

// Requires a valid login. Attaches req.user.
const protect = asyncHandler(async (req, res, next) => {
  const token = readToken(req);
  if (!token) throw new ApiError(401, 'Please log in to continue');

  // Invalid/expired tokens throw JsonWebTokenError, which errorHandler maps to 401.
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'This account no longer exists');

  req.user = user;
  next();
});

module.exports = { protect };
