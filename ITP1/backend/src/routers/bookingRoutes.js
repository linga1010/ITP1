import express from 'express';
import { bookPriest, cancelBooking, getUserBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/book', bookPriest);
router.put('/cancel/:id', cancelBooking);
router.get('/user', getUserBookings);

export default router;
