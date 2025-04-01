import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data.error || 'Error cancelling booking');
    }
  };

  return (
    <div>
      <h2>Your Bookings</h2>
      {loading && <p>Loading bookings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.map(booking => (
        <div key={booking._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h3>{booking.event}</h3>
          <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
          <p>Priest: {booking.priest?.name}</p>
          <p>Status: {booking.status}</p>
          {booking.status === 'Booked' && (
            <button onClick={() => cancelBooking(booking._id)}>Cancel Booking</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserBookingList;
