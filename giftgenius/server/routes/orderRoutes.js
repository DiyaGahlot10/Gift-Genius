const express = require('express');
const { body } = require('express-validator');

const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { PAYMENT_METHODS } = require('../config/constants');

const router = express.Router();

// Checkout and order history both need a logged-in user.
router.use(protect);

const createRules = [
  body('shippingAddress').isObject().withMessage('Delivery details are required'),
  body('shippingAddress.name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2 to 60 characters'),
  body('shippingAddress.phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be 5 to 200 characters'),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 60 }).withMessage('Enter a valid city'),
  body('shippingAddress.state').trim().isLength({ min: 2, max: 60 }).withMessage('Enter a valid state'),
  body('shippingAddress.pincode')
    .trim()
    .matches(/^[1-9]\d{5}$/)
    .withMessage('Enter a valid 6-digit PIN code'),
  body('giftMessage')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 300 })
    .withMessage('Gift message can be at most 300 characters'),
  body('paymentMethod').isIn(PAYMENT_METHODS).withMessage('Please choose a payment method'),
];

router.post('/', createRules, validate, createOrder);
router.get('/my-orders', getMyOrders); // must stay above '/:id'
router.get('/:id', getOrderById);

module.exports = router;
