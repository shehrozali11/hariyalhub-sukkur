const mongoose = require('mongoose');

const nurserySchema = new mongoose.Schema(
  {
    nurseryName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, default: 'Sukkur' },
    specialty: { type: String, default: 'Indoor, Outdoor & Seasonal Plants' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
    rating: { type: Number, default: 4.8 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Nursery', nurserySchema);
