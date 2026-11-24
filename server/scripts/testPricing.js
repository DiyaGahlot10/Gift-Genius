// Usage:  npm run test:pricing
// Checks the cart/order money maths. No database needed.

const assert = require('assert');
const { calculateTotals, estimateDelivery } = require('../services/pricingService');
const { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } = require('../config/checkout');

let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

console.log(`Rules: free delivery from Rs ${FREE_DELIVERY_THRESHOLD}, otherwise Rs ${DELIVERY_CHARGE}\n`);

check('empty cart is all zeros', () => {
  const t = calculateTotals([]);
  assert.deepStrictEqual([t.itemCount, t.subtotal, t.deliveryCharge, t.total], [0, 0, 0, 0]);
});

check('small cart pays delivery', () => {
  const t = calculateTotals([{ price: 499, quantity: 1 }]);
  assert.strictEqual(t.subtotal, 499);
  assert.strictEqual(t.deliveryCharge, DELIVERY_CHARGE);
  assert.strictEqual(t.total, 499 + DELIVERY_CHARGE);
  assert.strictEqual(t.amountToFreeDelivery, FREE_DELIVERY_THRESHOLD - 499);
});

check('quantities multiply (2 x 399 + 1 x 549 = 1347, free delivery)', () => {
  const t = calculateTotals([
    { price: 399, quantity: 2 },
    { price: 549, quantity: 1 },
  ]);
  assert.strictEqual(t.itemCount, 3);
  assert.strictEqual(t.subtotal, 1347);
  assert.strictEqual(t.deliveryCharge, 0);
  assert.strictEqual(t.total, 1347);
});

check('exactly at the threshold ships free', () => {
  const t = calculateTotals([{ price: FREE_DELIVERY_THRESHOLD, quantity: 1 }]);
  assert.strictEqual(t.deliveryCharge, 0);
});

check('one rupee under the threshold still pays delivery', () => {
  const t = calculateTotals([{ price: FREE_DELIVERY_THRESHOLD - 1, quantity: 1 }]);
  assert.strictEqual(t.deliveryCharge, DELIVERY_CHARGE);
});

check('decimal prices do not leak floating-point noise (0.1 + 0.2 style)', () => {
  const t = calculateTotals([
    { price: 0.1, quantity: 1 },
    { price: 0.2, quantity: 1 },
  ]);
  assert.strictEqual(t.subtotal, 0.3);
});

check('total always equals subtotal + delivery', () => {
  for (let price = 100; price <= 3000; price += 137) {
    for (let quantity = 1; quantity <= 4; quantity += 1) {
      const t = calculateTotals([{ price, quantity }]);
      assert.strictEqual(t.total, Math.round((t.subtotal + t.deliveryCharge) * 100) / 100);
    }
  }
});

check('estimated delivery window is in the future and ordered', () => {
  const placed = new Date('2026-11-24T10:00:00Z');
  const { from, to } = estimateDelivery(placed);
  assert(from > placed && to > from);
});

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
