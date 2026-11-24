const express = require('express');
const { body } = require('express-validator');

const { getRecommendations } = require('../controllers/recommendationController');
const validate = require('../middleware/validate');
const {
  RELATIONSHIPS,
  OCCASIONS,
  PERSONALITIES,
  INTERESTS,
  GIFT_STYLES,
  BUDGETS,
} = require('../config/constants');

const router = express.Router();

const rules = [
  body('relationship').isIn(RELATIONSHIPS).withMessage('Please choose who you are shopping for'),
  body('occasion').isIn(OCCASIONS).withMessage('Please choose an occasion'),
  body('personalities')
    .isArray({ min: 1, max: PERSONALITIES.length })
    .withMessage('Please choose at least one personality trait'),
  body('personalities.*').isIn(PERSONALITIES).withMessage('Unknown personality trait'),
  body('interests')
    .isArray({ min: 1, max: INTERESTS.length })
    .withMessage('Please choose at least one interest'),
  body('interests.*').isIn(INTERESTS).withMessage('Unknown interest'),
  body('budget')
    .isIn(BUDGETS.map((b) => b.id))
    .withMessage('Please choose a budget'),
  body('giftStyle').isIn(GIFT_STYLES).withMessage('Please choose the kind of gift you prefer'),
];

router.post('/', rules, validate, getRecommendations);

module.exports = router;
