const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // price at the time of purchase
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, default: 'Simulated (no real payment)' },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['placed', 'cancelled'], default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
