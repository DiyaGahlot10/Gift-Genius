const express = require('express');
const { body, param } = require('express-validator');

const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', [body('productId').isMongoId().withMessage('Invalid product')], validate, addToWishlist);
router.delete(
  '/:productId',
  [param('productId').isMongoId().withMessage('Invalid product')],
  validate,
  removeFromWishlist
);

module.exports = router;
