const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { register, login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Slows down password guessing on login/register.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2 to 60 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain a letter')
    .bail()
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, me);

module.exports = router;
