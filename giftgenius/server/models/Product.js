const mongoose = require('mongoose');
const {
  CATEGORIES,
  OCCASIONS,
  PERSONALITIES,
  INTERESTS,
  GIFT_STYLES,
} = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, sparse: true, trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    whyGreatGift: { type: String, trim: true, default: '' },

    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be positive'] },
    originalPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(v) {
          return v == null || v >= this.price;
        },
        message: 'Original price cannot be lower than the selling price',
      },
    },
    image: { type: String, required: [true, 'Image is required'] },

    category: { type: String, required: true, enum: { values: CATEGORIES, message: 'Invalid category: {VALUE}' } },

    // Metadata used by the recommendation engine
    tags: [{ type: String, lowercase: true, trim: true }],
    personalities: [{ type: String, enum: { values: PERSONALITIES, message: 'Invalid personality: {VALUE}' } }],
    interests: [{ type: String, enum: { values: INTERESTS, message: 'Invalid interest: {VALUE}' } }],
    occasions: [{ type: String, enum: { values: OCCASIONS, message: 'Invalid occasion: {VALUE}' } }],
    giftStyles: [{ type: String, enum: { values: GIFT_STYLES, message: 'Invalid gift style: {VALUE}' } }],

    specifications: { type: Map, of: String, default: {} },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    popularity: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ occasions: 1 });
productSchema.index({ isFeatured: 1, popularity: -1 });

module.exports = mongoose.model('Product', productSchema);
