const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateTotals, estimateDelivery } = require('../services/pricingService');

const OBJECT_ID = /^[a-f\d]{24}$/i;

const serializeOrder = (order) => {
  const plain = typeof order.toObject === 'function' ? order.toObject() : order;
  return { ...plain, estimatedDelivery: estimateDelivery(plain.createdAt) };
};

// Puts reserved stock back if anything fails after we have already taken it.
const releaseStock = async (reserved) => {
  try {
    await Promise.all(
      reserved.map((line) => Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } }))
    );
  } catch (err) {
    console.error('Could not release reserved stock:', err.message);
  }
};

// Order IDs are random, so on the rare collision just try again with a new one.
const createWithRetry = async (data) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await Order.create(data);
    } catch (err) {
      const isIdClash = err.code === 11000 && err.keyPattern && err.keyPattern.orderId;
      if (!isIdClash) throw err;
    }
  }
  throw new ApiError(500, 'Could not generate an order ID. Please try again.');
};

// POST /api/orders
// Body: { shippingAddress: {name, phone, address, city, state, pincode}, giftMessage?, paymentMethod }
// The items and every price come from the SERVER-side cart and product records.
// Anything the client sends about prices or totals is ignored.
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, giftMessage, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty');

  const products = await Product.find({ _id: { $in: cart.items.map((i) => i.product) } }).select(
    'name image price stock'
  );
  const byId = new Map(products.map((p) => [String(p._id), p]));

  // 1. Check availability and take a price snapshot.
  const problems = [];
  const lines = [];
  for (const item of cart.items) {
    const product = byId.get(String(item.product));
    if (!product) {
      problems.push('An item in your cart is no longer available. Please remove it and try again.');
    } else if (product.stock < item.quantity) {
      problems.push(
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} of ${product.name} left in stock`
      );
    } else {
      lines.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }
  }
  if (problems.length) throw new ApiError(409, problems[0], problems);

  // 2. Reserve stock atomically, then create the order. If anything fails, give the stock back.
  const reserved = [];
  let order;
  try {
    for (const line of lines) {
      const updated = await Product.findOneAndUpdate(
        { _id: line.product, stock: { $gte: line.quantity } },
        { $inc: { stock: -line.quantity } }
      );
      if (!updated) {
        throw new ApiError(409, `Sorry, ${line.name} just ran out of stock. Please review your cart.`);
      }
      reserved.push(line);
    }

    const totals = calculateTotals(lines.map((l) => ({ price: l.priceAtPurchase, quantity: l.quantity })));

    order = await createWithRetry({
      user: req.user._id,
      items: lines,
      // Only whitelisted fields are copied from the request.
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      },
      giftMessage: giftMessage || '',
      subtotal: totals.subtotal,
      deliveryCharge: totals.deliveryCharge,
      total: totals.total,
      paymentMethod,
      // Online payment is simulated for this academic project; COD is paid on delivery.
      paymentStatus: paymentMethod === 'demo-online' ? 'paid-demo' : 'pending',
    });
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }

  // 3. The order exists now, so clear the cart.
  await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: { order: serializeOrder(order) },
  });
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: { orders: orders.map(serializeOrder) } });
});

// GET /api/orders/:id   (accepts the order's _id or its GG-... order ID)
// The query includes the user, so someone else's order is simply "not found".
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const match = OBJECT_ID.test(id) ? { $or: [{ _id: id }, { orderId: id }] } : { orderId: id };

  const order = await Order.findOne({ user: req.user._id, ...match }).lean();
  if (!order) throw new ApiError(404, 'Order not found');

  res.json({ success: true, data: { order: serializeOrder(order) } });
});

module.exports = { createOrder, getMyOrders, getOrderById };
