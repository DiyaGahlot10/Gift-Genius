const User = require('../models/User');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const WISHLIST_FIELDS = 'name slug image price originalPrice rating numReviews stock category';

const sendWishlist = async (res, userId, extra = {}) => {
  const user = await User.findById(userId).populate({ path: 'wishlist', select: WISHLIST_FIELDS });
  const products = user.wishlist.filter(Boolean); // skip products deleted from the catalogue
  res.json({
    success: true,
    ...extra,
    data: { products, ids: products.map((p) => String(p._id)) },
  });
};

// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  await sendWishlist(res, req.user._id);
});

// POST /api/wishlist   { productId }   (adding twice is harmless)
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const exists = await Product.exists({ _id: productId });
  if (!exists) throw new ApiError(404, 'Product not found');

  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: productId } });
  await sendWishlist(res, req.user._id, { message: 'Added to your wishlist' });
});

// DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
  await sendWishlist(res, req.user._id, { message: 'Removed from your wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
