const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    nursery: { type: mongoose.Schema.Types.ObjectId, ref: 'Nursery', required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    commissionRate: { type: Number, default: 0.08 },
    platformCommission: { type: Number, required: true },
    nurseryPayout: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash on Delivery (COD)' },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
