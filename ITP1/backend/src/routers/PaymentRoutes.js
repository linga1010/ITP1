// src/routers/PaymentRoutes.js
import express from 'express';
import { processPayment } from '../controllers/PaymentController.js';

const router = express.Router();

// Route to process payment
router.post('/', processPayment);

export default router;
