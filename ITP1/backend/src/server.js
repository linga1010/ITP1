import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http'; // Add http server
import { Server } from 'socket.io'; // Import socket.io

// Import routes
import priestRoutes from './routers/priestRoutes.js';
import bookingRoutes from './routers/bookingRoutes.js';
import userRoutes from './routers/user.router.js';
import adminRoutes from './routers/admin.router.js';
import productRoutes from './routers/productRoutes.js';
import packageRoutes from './routers/packageRoutes.js';
import invoiceRoutes from './routers/invoiceRoutes.js';
import orderRoutes from './routers/OrderRoutes.js';
import feedbackRoutes from './routers/FeedbackRoutes.js';
import purchaseRoutes from './routers/purchaseRoutes.js';
import paymentRoutes from './routers/PaymentRoutes.js';
import viewPaymentRoutes from './routers/ViewPaymentRoutes.js';

import chatRoutes from './routers/chatRoutes.js'; // ✅ Import chat routes
import Chat from './models/Chat.js'; // ✅ Import Chat model

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app); // Create server for socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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

// API Routes
app.use('/api/priests', priestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/viewPaymentDetails', viewPaymentRoutes);

app.use('/api/chats', chatRoutes); // ✅ Added Chat API

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ----------------- Socket.IO Chat Logic -----------------
const activeUsers = {}; // { email: socketId }
const messageQueue = {}; // Queue to store messages for offline users

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // User or admin joins the room (identifiable by email)
  socket.on('joinRoom', (userEmail) => {
    console.log(`User ${userEmail} joined room ${userEmail}`);
    socket.join(userEmail);
    activeUsers[userEmail] = socket.id;

    // Send updated user list to admin (using emails)
    io.emit('userList', Object.keys(activeUsers).map(email => ({ _id: email, name: email })));
  });

  // Listen for sendMessage event from users or admin
  socket.on('sendMessage', async (data) => {
    const { senderEmail, receiverEmail, message } = data;

    // Create a new chat message and save it to the database
    const chat = new Chat({
      senderId: senderEmail,
      receiverId: receiverEmail,
      message: message,
    });

    try {
      const savedChat = await chat.save();
      console.log('Message saved successfully:', savedChat);

      // If the receiver is online, send the message immediately
      if (activeUsers[receiverEmail]) {
        io.to(activeUsers[receiverEmail]).emit('message', savedChat);
      } else {
        // If the receiver (admin or user) is offline, add message to the queue
        if (!messageQueue[receiverEmail]) {
          messageQueue[receiverEmail] = [];
        }
        messageQueue[receiverEmail].push(savedChat);
      }

      // Emit the message back to the sender (for confirmation)
      io.to(activeUsers[senderEmail]).emit('message', savedChat);

    } catch (error) {
      console.error('Error saving chat:', error.message);
      io.to(activeUsers[senderEmail]).emit('messageError', { error: 'Failed to save message.' });
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    for (let email in activeUsers) {
      if (activeUsers[email] === socket.id) {
        console.log(`${email} disconnected`);
        delete activeUsers[email];

        // Deliver any queued messages when the user comes back online
        if (messageQueue[email]) {
          messageQueue[email].forEach(msg => {
            io.to(socket.id).emit('message', msg);
          });
          delete messageQueue[email];
        }
      }
    }
  });
});

// ----------------- End of Socket.IO -----------------

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
