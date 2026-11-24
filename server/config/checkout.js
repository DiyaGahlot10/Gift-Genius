// Delivery and cart rules. Prices are in Indian rupees (INR).

module.exports = {
  // Orders with a subtotal at or above this amount ship free.
  FREE_DELIVERY_THRESHOLD: 999,
  // Flat delivery charge below the threshold.
  DELIVERY_CHARGE: 49,
  // Most units of a single product in one cart.
  MAX_QTY_PER_ITEM: 10,
  // Estimated delivery window, in days after the order is placed.
  DELIVERY_DAYS: { min: 3, max: 6 },
};
