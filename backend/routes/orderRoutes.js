const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAdmin, requireNurseryOwner } = require('../middleware/auth');

const router = express.Router();
const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.08');

router.post('/', async (req, res) => {
  try {
    const { productId, customerName, customerPhone, deliveryAddress, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Selected item not found.' });

    const qty = Math.max(1, parseInt(quantity || 1, 10));
    const totalAmount = product.price * qty;
    const platformCommission = Math.round(totalAmount * COMMISSION_RATE);
    const nurseryPayout = totalAmount - platformCommission;
    const orderCode = 'HH-' + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create({
      orderCode,
      product: product._id,
      nursery: product.nursery,
      customerName,
      customerPhone,
      deliveryAddress,
      quantity: qty,
      unitPrice: product.price,
      totalAmount,
      commissionRate: COMMISSION_RATE,
      platformCommission,
      nurseryPayout
    });
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(400).json({ message: 'Order failed', error: err.message });
  }
});

router.get('/my-orders', requireNurseryOwner, async (req, res) => {
  try {
    const orders = await Order.find({ nursery: req.user.id })
      .populate('product', 'name category price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'name category')
      .populate('nursery', 'nurseryName area')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});

module.exports = router;
