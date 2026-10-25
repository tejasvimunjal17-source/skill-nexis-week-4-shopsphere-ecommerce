// Run with: npm run seed
// Creates the first ADMIN account (from your .env) and some SAMPLE products if the shop is empty.
const { loadConfig } = require('../config/env');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const { hashPassword } = require('../utils/password');
const { validateRegister, hasErrors } = require('../utils/validators');

const img = (seed) => `https://picsum.photos/seed/${seed}/600/450`;

const SAMPLE_PRODUCTS = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with deep bass and 30-hour battery life.', 59.99, 'Electronics', 25],
  ['Smart Watch', 'Fitness tracking, heart-rate monitor and phone notifications on your wrist.', 79.5, 'Electronics', 15],
  ['Portable Speaker', 'Water-resistant pocket speaker with clear sound for trips and picnics.', 34.0, 'Electronics', 40],
  ['USB-C Fast Charger', '30W compact wall charger for phones, tablets and small laptops.', 19.99, 'Electronics', 60],
  ['Cotton T-Shirt', 'Soft everyday t-shirt made from 100% combed cotton.', 14.99, 'Clothing', 100],
  ['Denim Jacket', 'Classic blue denim jacket with a comfortable relaxed fit.', 49.0, 'Clothing', 20],
  ['Running Shoes', 'Lightweight breathable running shoes with a cushioned sole.', 64.95, 'Clothing', 30],
  ['Stainless Steel Bottle', 'Keeps drinks cold for 24 hours or hot for 12 hours. 750 ml.', 22.5, 'Home', 50],
  ['Ceramic Coffee Mug', 'Hand-glazed 350 ml mug that is dishwasher and microwave safe.', 9.99, 'Home', 80],
  ['LED Desk Lamp', 'Adjustable desk lamp with three brightness levels and a USB port.', 27.0, 'Home', 35],
  ['Notebook Set (3 pack)', 'A5 ruled notebooks with soft covers, 120 pages each.', 11.49, 'Stationery', 70],
  ['Gel Pen Pack (10)', 'Smooth-writing gel pens in assorted colours.', 6.99, 'Stationery', 0],
].map(([name, description, price, category, stock]) => ({
  name, description, price, category, stock, image: img(name.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
}));

async function run() {
  const config = loadConfig();
  await connectDB(config.mongoUri);

  const adminInput = {
    name: process.env.SEED_ADMIN_NAME || 'Shop Admin',
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
  };
  const { errors, value } = validateRegister(adminInput);
  if (hasErrors(errors)) {
    throw new Error('Check SEED_ADMIN_* in .env: ' + Object.values(errors).join(' '));
  }

  const existing = await User.findOne({ email: value.email });
  if (existing) {
    console.log(`Admin/user ${value.email} already exists - not changed.`);
  } else {
    await User.create({ name: value.name, email: value.email, passwordHash: await hashPassword(value.password), role: 'admin' });
    console.log(`Admin account created: ${value.email}`);
  }

  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(SAMPLE_PRODUCTS);
    console.log(`${SAMPLE_PRODUCTS.length} sample products added.`);
  } else {
    console.log('Products already exist - sample products skipped.');
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
