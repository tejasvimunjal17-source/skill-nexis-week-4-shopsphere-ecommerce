const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0, max: 1000000 },
    category: { type: String, required: true, trim: true, maxlength: 50, index: true },
    image: { type: String, trim: true, maxlength: 500, default: '' },
    stock: { type: Number, required: true, min: 0, max: 100000, default: 0, validate: Number.isInteger },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
