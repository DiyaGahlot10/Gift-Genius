// Usage:  npm run advance-order -- <orderId> [status]
//   npm run advance-order -- GG-20261124-4F7K            moves the order to the next status
//   npm run advance-order -- GG-20261124-4F7K Shipped    sets a specific status
//   npm run advance-order -- --list                      shows the 10 newest orders
//
// The MVP has no admin panel, so this is how you demonstrate order tracking in the viva:
// run it, then refresh "My Orders" in the browser.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Order = require('../models/Order');
const { ORDER_STATUSES } = require('../config/constants');

const run = async () => {
  const [arg, wanted] = process.argv.slice(2);
  if (!arg) {
    console.log('Usage: npm run advance-order -- <orderId> [status]   or   npm run advance-order -- --list');
    console.log(`Statuses: ${ORDER_STATUSES.join(' > ')}`);
    return;
  }

  await connectDB();

  if (arg === '--list') {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();
    if (!orders.length) console.log('No orders yet.');
    orders.forEach((o) => console.log(`${o.orderId}  ${o.orderStatus.padEnd(13)}  Rs ${o.total}  ${o.createdAt.toISOString()}`));
    return;
  }

  const order = await Order.findOne({ orderId: arg });
  if (!order) {
    console.error(`No order with ID ${arg}. Run with --list to see recent orders.`);
    process.exitCode = 1;
    return;
  }

  let next = wanted;
  if (next) {
    next = ORDER_STATUSES.find((s) => s.toLowerCase() === next.toLowerCase());
    if (!next) {
      console.error(`Unknown status. Choose one of: ${ORDER_STATUSES.join(', ')}`);
      process.exitCode = 1;
      return;
    }
  } else {
    const i = ORDER_STATUSES.indexOf(order.orderStatus);
    if (i === ORDER_STATUSES.length - 1) {
      console.log(`${order.orderId} is already ${order.orderStatus}.`);
      return;
    }
    next = ORDER_STATUSES[i + 1];
  }

  const previous = order.orderStatus;
  order.orderStatus = next;
  // Cash orders count as paid once delivered.
  if (next === 'Delivered' && order.paymentMethod === 'cod') order.paymentStatus = 'paid';
  await order.save();
  console.log(`${order.orderId}: ${previous} -> ${next}`);
};

run()
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
