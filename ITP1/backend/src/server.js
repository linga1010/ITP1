import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes from both server files
import priestRoutes from './routers/priestRoutes.js';
import bookingRoutes from './routers/bookingRoutes.js';
import userRoutes from './routers/user.router.js';
import adminRoutes from './routers/admin.router.js';
import productRoutes from './routers/productRoutes.js';
import packageRoutes from './routers/packageRoutes.js';
import invoiceRoutes from './routers/invoiceRoutes.js';
import orderRoutes from './routers/OrderRoutes.js';
import feedbackRoutes from './routers/FeedbackRoutes.js';

import purchaseRoutes from './routers/purchaseRoutes.js';  // ✅ Added Purchase Routes
import paymentRoutes from './routers/PaymentRoutes.js';
import viewPaymentRoutes from './routers/ViewPaymentRoutes.js';



dotenv.config(); // Load environment variables

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB connection
console.log("MongoDB URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is undefined.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running!' });
});

// API Routes from both servers
app.use('/api/priests', priestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api/purchases', purchaseRoutes);  // ✅ New Purchase API
app.use('/api/payment', paymentRoutes);
app.use('/api/viewPaymentDetails', viewPaymentRoutes);

app.use('/api/purchases', purchaseRoutes);


// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
