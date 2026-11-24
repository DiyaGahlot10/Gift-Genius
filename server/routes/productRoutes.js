const express = require('express');
const { query } = require('express-validator');

const { getProducts, getProductById, getMeta } = require('../controllers/productController');
const validate = require('../middleware/validate');
const { CATEGORIES, OCCASIONS, PERSONALITIES } = require('../config/constants');

const router = express.Router();

const listRules = [
  query('category').optional().isIn(CATEGORIES).withMessage('Unknown category'),
  query('occasion').optional().isIn(OCCASIONS).withMessage('Unknown occasion'),
  query('personality').optional().isIn(PERSONALITIES).withMessage('Unknown personality'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('sort')
    .optional()
    .isIn(['popularity', 'price-asc', 'price-desc', 'rating', 'newest'])
    .withMessage('Unknown sort option'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be 1 or more'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

router.get('/', listRules, validate, getProducts);
router.get('/meta', getMeta); // must stay above '/:id'
router.get('/:id', getProductById);

module.exports = router;
