import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getUsers, removeUser } from '../controllers/adminController.js'; // Admin controller functions

const router = express.Router();

// Admin dashboard route (protected and admin-only)
router.get('/admin-dashboard', protect, adminOnly, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard' });
});

// Route to get all users (admin-only)
router.get('/users', protect, adminOnly, getUsers);

// Route to delete a user (admin-only)
router.delete('/users/:id', protect, adminOnly, removeUser);

export default router;
