require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Nursery = require('../models/Nursery');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SeasonGuide = require('../models/SeasonGuide');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hariyalhub_sukkur';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Seeding Sukkur demo dataset with images...');

  await Nursery.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await SeasonGuide.deleteMany({});

  const passHash = await bcrypt.hash('nursery123', 10);

  const nurseries = await Nursery.insertMany([
    {
      nurseryName: 'Sindh Green Valley Nursery (Sample)',
      ownerName: 'Bilal Ahmed',
      email: 'bilal@sindhgreen.pk',
      phone: '0300-3145821',
      cnic: '45504-1234567-1',
      passwordHash: passHash,
      area: 'Race Course Road, Sukkur',
      specialty: 'Indoor Air-Purifying Plants & Ornamental Palms',
      description: 'Sample nursery near Race Course Road offering indoor plants, ceramic pots, and organic compost.',
      status: 'approved',
      isDemo: true,
      rating: 4.9
    },
    {
      nurseryName: 'Indus Bank Fruit & Sapling Farm (Sample)',
      ownerName: 'Tariq Mahmood',
      email: 'tariq@indusfarm.pk',
      phone: '0333-7120944',
      cnic: '45504-7654321-3',
      passwordHash: passHash,
      area: 'Rohri Bypass, Sukkur',
      specialty: 'Sindhri Mango, Guava Saplings & Heirloom Vegetable Seeds',
      description: 'Sample farm specializing in heat-tolerant fruit saplings and kitchen garden seeds suited for Upper Sindh soil.',
      status: 'approved',
      isDemo: true,
      rating: 4.8
    },
    {
      nurseryName: 'Rohri Botanicals & Rose Garden (Pending Demo)',
      ownerName: 'Usman Ghani',
      email: 'usman@rohribotanicals.pk',
      phone: '0312-8890123',
      cnic: '45501-9988776-5',
      passwordHash: passHash,
      area: 'Gurdwara Chowk, Sukkur',
      specialty: 'Desi Roses, Jasmine (Motia) & Seasonal Flowering Seeds',
      description: 'New local nursery awaiting Super Admin approval in the Admin Portal.',
      status: 'pending',
      isDemo: true,
      rating: 4.7
    }
  ]);

  const products = await Product.insertMany([
    {
      nursery: nurseries[0]._id,
      name: 'Snake Plant (Sansevieria)',
      category: 'Indoor Plants',
      price: 850,
      stock: 25,
      spaceSuitability: 'Low Light / Apartment',
      season: 'All Seasons',
      wateringGuide: 'Once every 7-10 days; let soil dry completely',
      careInstructions: 'Ideal for Sukkur bedrooms and offices. Tolerates AC rooms and low indirect light.',
      imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      isDemo: true
    },
    {
      nursery: nurseries[0]._id,
      name: 'Money Plant (Golden Pothos)',
      category: 'Indoor Plants',
      price: 550,
      stock: 40,
      spaceSuitability: 'Low Light / Apartment',
      season: 'All Seasons',
      wateringGuide: 'Twice a week in summer, once a week in winter',
      careInstructions: 'Keep away from direct afternoon glare. Mist leaves during dry Sukkur heat.',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
      isDemo: true
    },
    {
      nursery: nurseries[1]._id,
      name: 'Grafted Sindhri Mango Sapling',
      category: 'Seasonal Fruits',
      price: 1200,
      stock: 15,
      spaceSuitability: 'Full Sun / Lawn',
      season: 'Monsoon (Barsat)',
      wateringGuide: 'Deep watering every 3 days during establishment',
      careInstructions: 'Plant in deep loamy soil with farmyard manure. Thrives in Upper Sindh sunshine.',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      isDemo: true
    },
    {
      nursery: nurseries[1]._id,
      name: 'Desi Bhindi (Okra) & Tomato Kitchen Seed Pack',
      category: 'Seeds & Saplings',
      price: 320,
      stock: 60,
      spaceSuitability: 'Balcony / Partial Sun',
      season: 'Spring (Bahar)',
      wateringGuide: 'Light daily watering until germination (5-7 days)',
      careInstructions: 'Sow 1 inch deep in coco-peat + garden soil mix. High germination rate for home pots.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      isDemo: true
    },
    {
      nursery: nurseries[0]._id,
      name: 'Organic Vermicompost & Neem Cake Mix (5kg)',
      category: 'Soil & Fertilizers',
      price: 650,
      stock: 30,
      spaceSuitability: 'Balcony / Partial Sun',
      season: 'All Seasons',
      wateringGuide: 'Mix 20% into potting soil every 30 days',
      careInstructions: '100% organic nutrient booster that protects roots from termites and fungal rot.',
      imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
      isFeatured: false,
      isDemo: true
    }
  ]);

  await SeasonGuide.insertMany([
    {
      season: 'Summer (Garmi: May–Jul)',
      tempRange: '42°C – 48°C in Sukkur',
      recommendedPlants: 'Snake Plant, Aloe Vera, Bougainvillea, Sadabahar, Okra (Bhindi)',
      instructions: [
        'Water early before 7:30 AM or after sunset to prevent root scalding.',
        'Install 50% green shade net over rooftops and south-facing balconies.',
        'Apply 2-inch dry leaf or coco-peat mulch to lock moisture in pots.'
      ]
    },
    {
      season: 'Monsoon (Barsat: Jul–Sep)',
      tempRange: '34°C – 40°C + Humidity',
      recommendedPlants: 'Sindhri Mango Saplings, Guava, Motia (Jasmine), Lemongrass',
      instructions: [
        'Best planting window for fruit saplings across Sukkur & Rohri.',
        'Ensure drainage holes in pots are clear to prevent waterlogging.',
        'Spray organic neem oil every 15 days against monsoon whiteflies.'
      ]
    },
    {
      season: 'Winter (Sardi: Nov–Feb)',
      tempRange: '8°C – 22°C Mild & Sunny',
      recommendedPlants: 'Desi Rose, Marigold, Petunia, Spinach (Palak), Coriander, Tomato',
      instructions: [
        'Place flowering annuals and kitchen greens in full direct sunlight.',
        'Reduce watering frequency to every 3-4 days for indoor plants.',
        'Mix vermicompost into topsoil before sowing winter vegetable seeds.'
      ]
    }
  ]);

  await Order.create({
    orderCode: 'HH-482910',
    product: products[0]._id,
    nursery: nurseries[0]._id,
    customerName: 'Zainab Fatima',
    customerPhone: '0301-4455667',
    deliveryAddress: 'House 14, Muslim Cooperative Housing Society, Sukkur',
    quantity: 2,
    unitPrice: 850,
    totalAmount: 1700,
    commissionRate: 0.08,
    platformCommission: 136,
    nurseryPayout: 1564,
    status: 'Delivered'
  });

  console.log('Seed completed with images!');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});