const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Nursery = require('../models/Nursery');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hariyalhub_sukkur_iba_secret_2026';

router.post('/nursery/apply', async (req, res) => {
  try {
    const { nurseryName, ownerName, email, phone, cnic, password, area, specialty, description } = req.body;
    if (!nurseryName || !ownerName || !email || !phone || !cnic || !password || !area) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }
    const exists = await Nursery.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'An application or account already exists with this email.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const nursery = await Nursery.create({
      nurseryName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      cnic,
      passwordHash,
      area,
      specialty: specialty || 'Indoor, Outdoor & Seasonal Plants',
      description: description || '',
      status: 'pending',
      isDemo: false
    });
    res.status(201).json({
      message: 'Application submitted! Pending Super Admin approval.',
      nursery: {
        id: nursery._id,
        nurseryName: nursery.nurseryName,
        ownerName: nursery.ownerName,
        email: nursery.email,
        status: nursery.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
});

router.post('/nursery/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const nursery = await Nursery.findOne({ email: (email || '').toLowerCase() });
    if (!nursery) return res.status(404).json({ message: 'No nursery account found with this email.' });
    const valid = await bcrypt.compare(password, nursery.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Incorrect password.' });

    const token = jwt.sign(
      { id: nursery._id, role: 'nursery_owner', email: nursery.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      nursery: {
        id: nursery._id,
        nurseryName: nursery.nurseryName,
        ownerName: nursery.ownerName,
        email: nursery.email,
        phone: nursery.phone,
        area: nursery.area,
        status: nursery.status,
        rejectionReason: nursery.rejectionReason,
        isDemo: nursery.isDemo
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hariyalhub.pk';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  if ((email || '').toLowerCase() !== adminEmail.toLowerCase() || password !== adminPass) {
    return res.status(401).json({ message: 'Invalid Super Admin credentials.' });
  }
  const token = jwt.sign({ role: 'superadmin', email: adminEmail }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, admin: { email: adminEmail, name: 'HariyalHub Super Admin' } });
});

module.exports = router;
