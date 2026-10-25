const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { buildOrder } = require('../utils/pricing');
const { validateOrderInput, hasErrors, isValidObjectId } = require('../utils/validators');

async function releaseStock(reserved) {
  await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.quantity } })));
}

// POST /api/orders  (logged-in users)
// The browser only sends product ids + quantities. Prices and the total are calculated here.
exports.create = asyncHandler(async (req, res) => {
  const { errors, value } = validateOrderInput(req.body);
  if (hasErrors(errors)) throw new ApiError(400, 'Please check your order details.', errors);

  const ids = [...new Set(value.items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const { lines, total, errors: problems } = buildOrder(value.items, byId);
  if (problems.length) {
    throw new ApiError(409, 'Some items cannot be ordered.', Object.fromEntries(problems.map((p) => [p.productId, p.message])));
  }

  // Reserve stock one product at a time; the "stock >= quantity" condition prevents overselling.
  const reserved = [];
  for (const line of lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.product, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } }
    );
    if (!updated) {
      await releaseStock(reserved);
      throw new ApiError(409, 'Stock changed while ordering.', { [line.product]: `"${line.name}" just sold out or has less stock now.` });
    }
    reserved.push(line);
  }

  try {
    const order = await Order.create({
      user: req.user._id,
      items: lines.map(({ product, name, image, price, quantity }) => ({ product, name, image, price, quantity })),
      shippingAddress: value.shippingAddress,
      total,
    });
    res.status(201).json({ order });
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }
});

// GET /api/orders/mine  (only the logged-in user's own orders)
exports.mine = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// GET /api/orders/:id  (owner or admin)
exports.getOne = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new ApiError(404, 'Order not found.');
  const order = await Order.findById(req.params.id);
  const allowed = order && (String(order.user) === String(req.user._id) || req.user.role === 'admin');
  if (!allowed) throw new ApiError(404, 'Order not found.'); // same message so ids cannot be probed
  res.json({ order });
});
