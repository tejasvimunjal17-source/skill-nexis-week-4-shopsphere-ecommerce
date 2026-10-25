const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validateProduct, hasErrors, isValidObjectId } = require('../utils/validators');
const { parseListQuery, escapeRegex } = require('../utils/listQuery');

function findProductOr404(id) {
  if (!isValidObjectId(id)) throw new ApiError(404, 'Product not found.');
  return Product.findById(id).then((p) => {
    if (!p) throw new ApiError(404, 'Product not found.');
    return p;
  });
}

// GET /api/products?search=&category=&sort=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, search, category, sort } = parseListQuery(req.query);

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  if (category) filter.category = category;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, pages: Math.max(Math.ceil(total / limit), 1), total });
});

// GET /api/products/categories
exports.categories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
});

// GET /api/products/:id
exports.getOne = asyncHandler(async (req, res) => {
  res.json({ product: await findProductOr404(req.params.id) });
});

// POST /api/products  (admin)
exports.create = asyncHandler(async (req, res) => {
  const { errors, value } = validateProduct(req.body);
  if (hasErrors(errors)) throw new ApiError(400, 'Please fix the highlighted fields.', errors);
  const product = await Product.create(value);
  res.status(201).json({ product });
});

// PUT /api/products/:id  (admin)
exports.update = asyncHandler(async (req, res) => {
  const { errors, value } = validateProduct(req.body, { partial: true });
  if (hasErrors(errors)) throw new ApiError(400, 'Please fix the highlighted fields.', errors);
  if (Object.keys(value).length === 0) throw new ApiError(400, 'No valid fields to update.');
  if (!isValidObjectId(req.params.id)) throw new ApiError(404, 'Product not found.');

  const product = await Product.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ product });
});

// DELETE /api/products/:id  (admin)
exports.remove = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) throw new ApiError(404, 'Product not found.');
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ message: 'Product deleted.' });
});
