const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Place after express-validator rule chains. Returns 400 with per-field messages.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return next(new ApiError(400, details[0].message, details));
};

module.exports = validate;
