const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nursery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nursery',
      required: true
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Indoor Plants', 'Outdoor Plants', 'Seeds & Saplings', 'Seasonal Fruits', 'Soil & Fertilizers'],
      required: true
    },
    price: { type: Number, required: true, min: 1 },
    stock: { type: Number, default: 20, min: 0 },
    spaceSuitability: {
      type: String,
      enum: ['Low Light / Apartment', 'Balcony / Partial Sun', 'Full Sun / Lawn'],
      default: 'Balcony / Partial Sun'
    },
    season: {
      type: String,
      enum: ['All Seasons', 'Summer (Garmi)', 'Monsoon (Barsat)', 'Winter (Sardi)', 'Spring (Bahar)'],
      default: 'All Seasons'
    },
    wateringGuide: { type: String, default: 'Water 2-3 times a week in Sukkur weather' },
    careInstructions: { type: String, default: 'Keep in well-drained soil; protect from harsh afternoon heat in June.' },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'
    },
    isFeatured: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);