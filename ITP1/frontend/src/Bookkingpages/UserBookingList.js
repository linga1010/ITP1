import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const UserBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  const fetchBookings = async () => {
    if (!user) {
      setError('Please log in to view your bookings.');
      return;
    }
    setLoading(true);
    try {
      // Ensure your backend route is set to serve only the user’s bookings
      const res = await axios.get('http://localhost:5000/api/bookings/user', {
        // Optionally, send auth token if needed:
        // headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookings(res.data);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, user]);

  const cancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data.error || 'Error cancelling booking.');
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view your bookings.</p>;

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
