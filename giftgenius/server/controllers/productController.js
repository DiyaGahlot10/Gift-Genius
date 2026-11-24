const mongoose = require('mongoose');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  CATEGORIES,
  OCCASIONS,
  PERSONALITIES,
  INTERESTS,
  GIFT_STYLES,
  RELATIONSHIPS,
  BUDGETS,
} = require('../config/constants');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTS = {
  popularity: { popularity: -1, rating: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  newest: { createdAt: -1 },
};

// GET /api/products
// Query: search, category, occasion, personality, minPrice, maxPrice, featured, sort, page, limit
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, occasion, personality, minPrice, maxPrice, featured, sort } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  const filter = {};

  if (search && search.trim()) {
    // Partial, case-insensitive match on name or tags ("jour" finds "Leather Journal").
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { tags: rx }];
  }
  if (category) filter.category = category;
  if (occasion) filter.occasions = occasion;
  if (personality) filter.personalities = personality;
  if (featured === 'true') filter.isFeatured = true;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  const sortSpec = SORTS[sort] || SORTS.popularity;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      products,
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    },
  });
});

// GET /api/products/:id  (also returns related products)
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid product id');

  const product = await Product.findById(id).lean();
  if (!product) throw new ApiError(404, 'Product not found');

  // Related: same category first, then anything sharing an interest or occasion.
  const RELATED_LIMIT = 4;
  let related = await Product.find({ _id: { $ne: product._id }, category: product.category })
    .sort({ popularity: -1 })
    .limit(RELATED_LIMIT)
    .lean();

  if (related.length < RELATED_LIMIT) {
    const have = [product._id, ...related.map((r) => r._id)];
    const more = await Product.find({
      _id: { $nin: have },
      $or: [{ interests: { $in: product.interests } }, { occasions: { $in: product.occasions } }],
    })
      .sort({ popularity: -1 })
      .limit(RELATED_LIMIT - related.length)
      .lean();
    related = related.concat(more);
  }

  res.json({ success: true, data: { product, related } });
});

// GET /api/products/meta  (vocabulary and price bounds for filters and the gift finder)
const getMeta = asyncHandler(async (req, res) => {
  const [bounds] = await Product.aggregate([
    { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
  ]);

  res.json({
    success: true,
    data: {
      categories: CATEGORIES,
      occasions: OCCASIONS,
      personalities: PERSONALITIES,
      interests: INTERESTS,
      giftStyles: GIFT_STYLES,
      relationships: RELATIONSHIPS,
      budgets: BUDGETS,
      priceRange: bounds ? { min: bounds.min, max: bounds.max } : { min: 0, max: 0 },
    },
  });
});

module.exports = { getProducts, getProductById, getMeta };
