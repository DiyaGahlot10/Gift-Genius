const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateTotals, round2 } = require('../services/pricingService');
const { MAX_QTY_PER_ITEM } = require('../config/checkout');

const PRODUCT_FIELDS = 'name slug image price originalPrice stock category';

const sameId = (a, b) => String(a) === String(b);

// One cart per user. Upsert is safe against double creation thanks to the unique index on user.
const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

// Turns a cart document into the response the client needs: product details,
// line totals and server-calculated totals. Products deleted from the catalogue
// are quietly removed from the cart.
const buildCartResponse = async (cart) => {
  await cart.populate('items.product', PRODUCT_FIELDS);

  const live = cart.items.filter((item) => item.product);
  if (live.length !== cart.items.length) {
    await Cart.updateOne(
      { _id: cart._id },
      { $set: { items: live.map((i) => ({ product: i.product._id, quantity: i.quantity })) } }
    );
  }

  const items = live.map((item) => {
    const p = item.product;
    return {
      product: {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        category: p.category,
      },
      quantity: item.quantity,
      lineTotal: round2(p.price * item.quantity),
      // false when stock has dropped below the quantity in the cart; checkout will refuse it.
      available: p.stock >= item.quantity,
    };
  });

  const totals = calculateTotals(items.map((i) => ({ price: i.product.price, quantity: i.quantity })));
  return { items, ...totals };
};

const sendCart = async (res, cart, extra = {}, status = 200) => {
  const data = await buildCartResponse(cart);
  res.status(status).json({ success: true, data: { ...data, ...extra } });
};

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await sendCart(res, cart);
});

// POST /api/cart   { productId, quantity? }
const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

  const product = await Product.findById(productId).select('name stock');
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.stock < 1) throw new ApiError(400, `${product.name} is out of stock`);

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => sameId(i.product, productId));
  const newQty = (existing ? existing.quantity : 0) + quantity;

  if (newQty > MAX_QTY_PER_ITEM) {
    throw new ApiError(400, `You can add at most ${MAX_QTY_PER_ITEM} of one item`);
  }
  if (newQty > product.stock) {
    throw new ApiError(400, `Only ${product.stock} of ${product.name} left in stock`);
  }

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, quantity });
  await cart.save();

  await sendCart(res, cart);
});

// PUT /api/cart/:productId   { quantity }   (sets the quantity; use DELETE to remove)
const updateQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const quantity = Number(req.body.quantity);

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => sameId(i.product, productId));
  if (!item) throw new ApiError(404, 'That item is not in your cart');

  const product = await Product.findById(productId).select('name stock');
  if (!product) throw new ApiError(404, 'Product not found');
  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} of ${product.name} left in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  await sendCart(res, cart);
});

// DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => !sameId(i.product, productId));
  await cart.save();
  await sendCart(res, cart);
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  await sendCart(res, cart);
});

// POST /api/cart/merge   { items: [{ productId, quantity }] }
// Called right after login to fold a guest's localStorage cart into the saved cart.
// Quantities are added together and clamped to stock and the per-item limit.
const mergeCart = asyncHandler(async (req, res) => {
  const incoming = req.body.items || [];
  const cart = await getOrCreateCart(req.user._id);
  const notes = [];

  const ids = [...new Set(incoming.map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: ids } }).select('name stock');
  const byId = new Map(products.map((p) => [String(p._id), p]));

  for (const { productId, quantity } of incoming) {
    const product = byId.get(String(productId));
    if (!product) {
      notes.push('An item in your saved cart is no longer available and was skipped.');
      continue;
    }
    if (product.stock < 1) {
      notes.push(`${product.name} is out of stock and was skipped.`);
      continue;
    }

    const existing = cart.items.find((i) => sameId(i.product, productId));
    const wanted = (existing ? existing.quantity : 0) + Number(quantity);
    const allowed = Math.min(wanted, MAX_QTY_PER_ITEM, product.stock);
    if (allowed < wanted) {
      notes.push(`${product.name}: quantity set to ${allowed} (stock or per-item limit).`);
    }

    if (existing) existing.quantity = allowed;
    else cart.items.push({ product: productId, quantity: allowed });
  }

  await cart.save();
  await sendCart(res, cart, { notes });
});

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart, mergeCart };
