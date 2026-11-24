// Pure pricing helpers shared by the cart and order code, so the totals the
// customer sees in the cart are always the totals the order is created with.

const { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE, DELIVERY_DAYS } = require('../config/checkout');

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {Array<{price:number, quantity:number}>} lines
 */
const calculateTotals = (lines) => {
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = round2(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));

  const qualifiesForFree = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryCharge = itemCount === 0 || qualifiesForFree ? 0 : DELIVERY_CHARGE;
  const total = round2(subtotal + deliveryCharge);
  const amountToFreeDelivery =
    itemCount === 0 || qualifiesForFree ? 0 : round2(FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    itemCount,
    subtotal,
    deliveryCharge,
    total,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountToFreeDelivery,
  };
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Estimated delivery window for an order placed at `placedAt`.
const estimateDelivery = (placedAt = new Date()) => ({
  from: addDays(placedAt, DELIVERY_DAYS.min),
  to: addDays(placedAt, DELIVERY_DAYS.max),
});

module.exports = { calculateTotals, estimateDelivery, round2 };
