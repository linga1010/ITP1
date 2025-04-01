import express from 'express';
import { bookPriest, cancelBooking, getUserBookings } from '../controllers/bookingController.js';

const router = express.Router();

// Create a booking for a priest on the base route
router.post('/', bookPriest);

// Cancel a booking (note: endpoint now becomes /api/bookings/:id/cancel)
router.put('/:id/cancel', cancelBooking);

// Get bookings for the logged-in user (endpoint: /api/bookings/user)
router.get('/user', getUserBookings);

export default router;
