import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes
import userRoutes from './routers/user.router.js';
import adminRoutes from './routers/admin.router.js';
import productRoutes from './routers/productRoutes.js';
import packageRoutes from './routers/packageRoutes.js';
import invoiceRoutes from './routers/invoiceRoutes.js';
import orderRoutes from './routers/OrderRoutes.js';
import paymentRoutes from './routers/PaymentRoutes.js';
import viewPaymentRoutes from './routers/ViewPaymentRoutes.js';

dotenv.config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

console.log("MongoDB URI:", process.env.MONGO_URI);
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is undefined.");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json()); // No need for bodyParser.json() if you're using express.json()
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/viewPaymentDetails', viewPaymentRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
