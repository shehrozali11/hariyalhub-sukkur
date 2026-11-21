const express = require('express');
const SeasonGuide = require('../models/SeasonGuide');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const guides = await SeasonGuide.find().sort({ createdAt: 1 });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: 'Error loading seasonal guides', error: err.message });
  }
});

router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const guide = await SeasonGuide.create(req.body);
    res.status(201).json(guide);
  } catch (err) {
    res.status(400).json({ message: 'Error adding guide', error: err.message });
  }
});

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    await SeasonGuide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Seasonal guide deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting guide', error: err.message });
  }
});

module.exports = router;
