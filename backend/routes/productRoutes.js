const express = require('express');
const Product = require('../models/Product');
const Nursery = require('../models/Nursery');
const { requireAdmin, requireNurseryOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const approvedNurseries = await Nursery.find({ status: 'approved' }).select('_id');
    const approvedIds = approvedNurseries.map((n) => n._id);
    const query = { nursery: { $in: approvedIds } };
    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    if (req.query.season && req.query.season !== 'All') query.season = req.query.season;
    if (req.query.nurseryId && req.query.nurseryId !== 'All') query.nursery = req.query.nurseryId;

    const products = await Product.find(query)
      .populate('nursery', 'nurseryName area phone isDemo rating')
      .sort({ isFeatured: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error loading catalog', error: err.message });
  }
});

router.get('/my-listings', requireNurseryOwner, async (req, res) => {
  try {
    const items = await Product.find({ nursery: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error loading listings', error: err.message });
  }
});

router.post('/', requireNurseryOwner, async (req, res) => {
  try {
    const nursery = await Nursery.findById(req.user.id);
    if (!nursery || nursery.status !== 'approved') {
      return res.status(403).json({
        message: 'Access denied: Your nursery application must be APPROVED by Super Admin before adding items.'
      });
    }
    const item = await Product.create({ ...req.body, nursery: nursery._id, isDemo: false });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Error creating listing', error: err.message });
  }
});

router.delete('/:id', requireNurseryOwner, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, nursery: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting item', error: err.message });
  }
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .populate('nursery', 'nurseryName area status isDemo')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error loading products', error: err.message });
  }
});

router.patch('/admin/:id/featured', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error toggling featured', error: err.message });
  }
});

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed by Super Admin' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing product', error: err.message });
  }
});

module.exports = router;
