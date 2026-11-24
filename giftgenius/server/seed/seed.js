// Usage:  npm run seed
// Replaces all products with the seed catalogue and creates the demo admin
// account (from ADMIN_EMAIL / ADMIN_PASSWORD in .env) if it does not exist.
// Users, carts and orders are NOT touched.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const products = require('./products');

const seedProducts = async () => {
  await Product.deleteMany({});
  const created = await Product.insertMany(products); // runs schema validation
  console.log(`Inserted ${created.length} products`);

  const byCategory = created.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byCategory).forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
};

const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.log('Skipped admin account (set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one)');
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  await User.create({ name: 'GiftGenius Admin', email, password, role: 'admin' });
  console.log(`Created admin account: ${email}`);
};

const run = async () => {
  try {
    await connectDB();
    await seedProducts();
    await seedAdmin();
    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    if (err.errors) {
      Object.values(err.errors).forEach((e) => console.error(' -', e.message));
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
