const express = require('express');
const Nursery = require('../models/Nursery');
const Product = require('../models/Product');
const { requireAdmin, requireNurseryOwner } = require('../middleware/auth');

const router = express.Router();

router.get('/approved', async (req, res) => {
  try {
    const nurseries = await Nursery.find({ status: 'approved' }).select('-passwordHash').sort({ createdAt: -1 });
    res.json(nurseries);
  } catch (err) {
    res.status(500).json({ message: 'Error loading nurseries', error: err.message });
  }
});

router.get('/me', requireNurseryOwner, async (req, res) => {
  try {
    const nursery = await Nursery.findById(req.user.id).select('-passwordHash');
    if (!nursery) return res.status(404).json({ message: 'Nursery not found' });
    res.json(nursery);
  } catch (err) {
    res.status(500).json({ message: 'Error loading profile', error: err.message });
  }
});

router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const nurseries = await Nursery.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(nurseries);
  } catch (err) {
    res.status(500).json({ message: 'Error loading all nurseries', error: err.message });
  }
});

router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = await Nursery.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? (rejectionReason || 'Incomplete Sukkur verification details.') : ''
      },
      { new: true }
    ).select('-passwordHash');
    if (!updated) return res.status(404).json({ message: 'Nursery not found' });
    res.json({ message: `Nursery status updated to ${status}`, nursery: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await Product.deleteMany({ nursery: req.params.id });
    await Nursery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nursery and associated listings deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting nursery', error: err.message });
  }
});

module.exports = router;
