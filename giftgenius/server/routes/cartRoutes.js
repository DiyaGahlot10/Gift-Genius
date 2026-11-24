const express = require('express');
const { body, param } = require('express-validator');

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  mergeCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { MAX_QTY_PER_ITEM } = require('../config/checkout');

const router = express.Router();

// Every cart route needs a logged-in user.
router.use(protect);

const qtyRule = (field) =>
  field.isInt({ min: 1, max: MAX_QTY_PER_ITEM }).withMessage(`Quantity must be between 1 and ${MAX_QTY_PER_ITEM}`);

router.get('/', getCart);

router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Invalid product'),
    qtyRule(body('quantity').optional()),
  ],
  validate,
  addToCart
);

router.post(
  '/merge',
  [
    body('items').isArray({ max: 50 }).withMessage('items must be a list of up to 50 products'),
    body('items.*.productId').isMongoId().withMessage('Invalid product in guest cart'),
    qtyRule(body('items.*.quantity')),
  ],
  validate,
  mergeCart
);

router.delete('/', clearCart);

router.put(
  '/:productId',
  [param('productId').isMongoId().withMessage('Invalid product'), qtyRule(body('quantity'))],
  validate,
  updateQuantity
);

router.delete(
  '/:productId',
  [param('productId').isMongoId().withMessage('Invalid product')],
  validate,
  removeFromCart
);

module.exports = router;
