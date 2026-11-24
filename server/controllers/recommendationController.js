const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { recommend } = require('../services/recommendationService');

// POST /api/recommendations
// Body: { relationship, occasion, personalities[], interests[], budget, giftStyle }
// The controller only fetches data and shapes the response; all scoring lives in the service.
const getRecommendations = asyncHandler(async (req, res) => {
  const { relationship, occasion, personalities, interests, budget, giftStyle } = req.body;

  const products = await Product.find({ stock: { $gt: 0 } }).lean();
  const data = recommend(products, { relationship, occasion, personalities, interests, budget, giftStyle });

  res.json({ success: true, data });
});

module.exports = { getRecommendations };
