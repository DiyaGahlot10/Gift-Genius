// Usage:  npm run test:api        (the server must be running, and the database seeded)
// Walks through the whole shopping flow over HTTP against http://localhost:5000
// and verifies cart maths, stock handling and order privacy.
// It creates two throw-away users (random emails) and one or two small orders.
// Requires Node 18+ (built-in fetch).

const assert = require('assert');

const BASE = process.env.API_URL || 'http://localhost:5000/api';
const stamp = Date.now();
const password = 'Test1234';

// A tiny client that remembers the login cookie for one user.
const makeClient = () => {
  let cookie = '';
  return async (method, path, body) => {
    const res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    const token = setCookies.map((c) => c.split(';')[0]).find((c) => c.startsWith('token='));
    if (token) cookie = token.endsWith('=') ? '' : token;
    const json = await res.json().catch(() => ({}));
    return { status: res.status, body: json, data: json.data };
  };
};

let failed = 0;
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  FAIL  ${name}\n        ${err.message}`);
  }
};

const address = {
  name: 'Test Buyer',
  phone: '9876543210',
  address: '12 MG Road, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
};

(async () => {
  const alice = makeClient();
  const bob = makeClient();
  const anon = makeClient();
  let products = [];
  let orderId;
  let orderMongoId;

  console.log(`Testing ${BASE}\n`);

  await step('server is up and the database is connected', async () => {
    const r = await anon('GET', '/health');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.database, 'connected');
  });

  await step('catalogue has been seeded (run npm run seed if this fails)', async () => {
    const r = await anon('GET', '/products?limit=50&sort=price-asc');
    assert(r.data.products.length >= 30, `only ${r.data.products.length} products found`);
    products = r.data.products;
  });

  await step('register two users', async () => {
    const a = await alice('POST', '/auth/register', { name: 'Alice Test', email: `alice${stamp}@example.com`, password });
    const b = await bob('POST', '/auth/register', { name: 'Bob Test', email: `bob${stamp}@example.com`, password });
    assert.strictEqual(a.status, 201, a.body.message);
    assert.strictEqual(b.status, 201, b.body.message);
  });

  await step('cart, orders and wishlist reject anonymous users (401)', async () => {
    for (const path of ['/cart', '/orders/my-orders', '/wishlist']) {
      const r = await anon('GET', path);
      assert.strictEqual(r.status, 401, `${path} returned ${r.status}`);
    }
  });

  const cheap = () => products.find((p) => p.price < 500 && p.stock >= 3);
  const mid = () => products.find((p) => p.price >= 500 && p.price < 900 && p.stock >= 3);

  await step('add to cart and the totals are calculated by the server', async () => {
    const a = cheap();
    const r = await alice('POST', '/cart', { productId: a._id, quantity: 2 });
    assert.strictEqual(r.status, 200, r.body.message);
    assert.strictEqual(r.data.items[0].quantity, 2);
    assert.strictEqual(r.data.subtotal, a.price * 2);
    assert.strictEqual(r.data.total, r.data.subtotal + r.data.deliveryCharge);
  });

  await step('adding the same product again increases the quantity', async () => {
    const r = await alice('POST', '/cart', { productId: cheap()._id, quantity: 1 });
    assert.strictEqual(r.data.items.length, 1);
    assert.strictEqual(r.data.items[0].quantity, 3);
  });

  await step('PUT sets an exact quantity', async () => {
    const r = await alice('PUT', `/cart/${cheap()._id}`, { quantity: 1 });
    assert.strictEqual(r.data.items[0].quantity, 1);
  });

  await step('quantity above the per-item limit is rejected (400)', async () => {
    const r = await alice('PUT', `/cart/${cheap()._id}`, { quantity: 11 });
    assert.strictEqual(r.status, 400);
  });

  await step('quantity above the available stock is rejected (400)', async () => {
    const low = products.find((p) => p.stock > 0 && p.stock < 10);
    if (!low) return; // every product has plenty of stock; nothing to test
    const r = await alice('PUT', `/cart/${cheap()._id}`, { quantity: 1 });
    assert.strictEqual(r.status, 200);
    const add = await alice('POST', '/cart', { productId: low._id, quantity: Math.min(10, low.stock + 1) });
    assert.strictEqual(add.status, 400, add.body.message);
    await alice('DELETE', `/cart/${low._id}`);
  });

  await step('guest cart merge adds quantities together', async () => {
    const m = mid();
    const r = await alice('POST', '/cart/merge', {
      items: [
        { productId: m._id, quantity: 1 },
        { productId: cheap()._id, quantity: 1 },
      ],
    });
    assert.strictEqual(r.status, 200, r.body.message);
    const lines = Object.fromEntries(r.data.items.map((i) => [i.product._id, i.quantity]));
    assert.strictEqual(lines[m._id], 1);
    assert.strictEqual(lines[cheap()._id], 2);
  });

  await step('the cart persists (a fresh GET returns the same items)', async () => {
    const r = await alice('GET', '/cart');
    assert.strictEqual(r.data.items.length, 2);
  });

  await step('remove an item', async () => {
    const r = await alice('DELETE', `/cart/${mid()._id}`);
    assert.strictEqual(r.data.items.length, 1);
  });

  await step('wishlist add, duplicate add, and remove', async () => {
    const p = products[0];
    await alice('POST', '/wishlist', { productId: p._id });
    const again = await alice('POST', '/wishlist', { productId: p._id });
    assert.strictEqual(again.data.ids.filter((id) => id === p._id).length, 1, 'duplicate in wishlist');
    const removed = await alice('DELETE', `/wishlist/${p._id}`);
    assert(!removed.data.ids.includes(p._id));
  });

  await step('checkout with an invalid phone number is rejected (400)', async () => {
    const r = await alice('POST', '/orders', {
      shippingAddress: { ...address, phone: '12345' },
      paymentMethod: 'cod',
    });
    assert.strictEqual(r.status, 400);
    const cart = await alice('GET', '/cart');
    assert(cart.data.items.length > 0, 'cart must be untouched after a rejected order');
  });

  await step('checkout with an empty cart is rejected (400)', async () => {
    const r = await bob('POST', '/orders', { shippingAddress: address, paymentMethod: 'cod' });
    assert.strictEqual(r.status, 400);
  });

  await step('place an order: stock drops, cart empties, prices are snapshotted', async () => {
    const before = (await anon('GET', `/products/${cheap()._id}`)).data.product.stock;
    const cart = (await alice('GET', '/cart')).data;
    const qty = cart.items[0].quantity;

    // The client tries to cheat by sending its own prices; the server must ignore them.
    const r = await alice('POST', '/orders', {
      shippingAddress: address,
      giftMessage: 'Happy birthday!',
      paymentMethod: 'cod',
      total: 1,
      subtotal: 1,
      items: [{ price: 1 }],
    });
    assert.strictEqual(r.status, 201, r.body.message);
    const order = r.data.order;
    orderId = order.orderId;
    orderMongoId = order._id;
    assert(/^GG-\d{8}-[A-Z0-9]{4}$/.test(orderId), `odd order id ${orderId}`);
    assert.strictEqual(order.subtotal, cart.subtotal);
    assert.strictEqual(order.total, cart.total);
    assert.strictEqual(order.orderStatus, 'Order Placed');
    assert.strictEqual(order.paymentStatus, 'pending');
    assert.strictEqual(order.items[0].priceAtPurchase, cart.items[0].product.price);

    const after = (await anon('GET', `/products/${cheap()._id}`)).data.product.stock;
    assert.strictEqual(after, before - qty, `stock went ${before} -> ${after}`);
    assert.strictEqual((await alice('GET', '/cart')).data.items.length, 0, 'cart should be empty');
  });

  await step('demo online payment is marked paid-demo', async () => {
    await alice('POST', '/cart', { productId: mid()._id, quantity: 1 });
    const r = await alice('POST', '/orders', { shippingAddress: address, paymentMethod: 'demo-online' });
    assert.strictEqual(r.status, 201, r.body.message);
    assert.strictEqual(r.data.order.paymentStatus, 'paid-demo');
  });

  await step('my-orders lists the newest order first', async () => {
    const r = await alice('GET', '/orders/my-orders');
    assert.strictEqual(r.data.orders.length, 2);
    assert(new Date(r.data.orders[0].createdAt) >= new Date(r.data.orders[1].createdAt));
  });

  await step('an order can be opened by its GG- id and by its database id', async () => {
    const a = await alice('GET', `/orders/${orderId}`);
    const b = await alice('GET', `/orders/${orderMongoId}`);
    assert.strictEqual(a.status, 200);
    assert.strictEqual(b.status, 200);
    assert.strictEqual(a.data.order.orderId, b.data.order.orderId);
  });

  await step("another user cannot read Alice's order (404) or see it in their list", async () => {
    const byId = await bob('GET', `/orders/${orderId}`);
    const byMongo = await bob('GET', `/orders/${orderMongoId}`);
    const list = await bob('GET', '/orders/my-orders');
    assert.strictEqual(byId.status, 404);
    assert.strictEqual(byMongo.status, 404);
    assert.strictEqual(list.data.orders.length, 0);
  });

  console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('\nCould not run the API test:', err.message);
  console.error('Is the server running (npm run dev) and the database seeded (npm run seed)?');
  process.exit(1);
});
