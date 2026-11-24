require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const nurseryRoutes = require('./routes/nurseryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const guideRoutes = require('./routes/guideRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'HariyalHub Full-Stack API', location: 'Sukkur, Sindh' });
});

app.use('/api/auth', authRoutes);
app.use('/api/nurseries', nurseryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/guides', guideRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hariyalhub_sukkur';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected:', MONGO_URI);
    app.listen(PORT, () => console.log(`HariyalHub Backend API running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
