// adminController.js

import User from '../models/user.model.js';
import Order from '../models/Order.js';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users); // Returning a success status
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Remove a user
export const removeUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error removing user' });
  }
};


// controllers/adminController.js
export const getAllBookings = async (req, res) => {
  try {
    // Replace `BookingModel` with your actual mongoose model name
    const bookings = await Order.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};
