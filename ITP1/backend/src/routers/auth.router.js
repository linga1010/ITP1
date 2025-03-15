import express from 'express';
import { registerUser, loginUser, forgotPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

// Protected Route
router.put('/change-password', protect, changePassword);

export default router;
