// Mirrors server/config/checkout.js so a guest's cart shows the same numbers.
// The server always recalculates at checkout, so these are for display only.
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_CHARGE = 49;
export const MAX_QTY_PER_ITEM = 10;

const round2 = (n) => Math.round(n * 100) / 100;

export const calculateTotals = (lines) => {
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const free = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryCharge = itemCount === 0 || free ? 0 : DELIVERY_CHARGE;
  return {
    itemCount,
    subtotal,
    deliveryCharge,
    total: round2(subtotal + deliveryCharge),
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountToFreeDelivery: itemCount === 0 || free ? 0 : round2(FREE_DELIVERY_THRESHOLD - subtotal),
  };
};
