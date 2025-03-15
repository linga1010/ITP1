const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const orderRoutes = require('./src/routes/orderRoutes');
const productRoutes = require('./src/routes/productRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes'); // Import Payment Details API
const Product = require('./src/models/Product'); // Ensure Product model is imported
const paymentDetailsRoutes = require('./src/routes/paymentDetailsRoutes'); // Fix file name

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Use Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-details', paymentDetailsRoutes); // Added payment details route

// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch from MongoDB
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
