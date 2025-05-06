import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; 
import UserComponent from "../Component/Usercomponent";


const UserBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();  // Initialize useNavigate

  const fetchBookings = async () => {
    if (!user) {
      setError('Please log in to view your bookings.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/user');
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

    <UserComponent user={user} />
    
    <div style={{ backgroundColor: 'rgba(250, 243, 243, 0.5)', padding: '20px' }}>
      <h2>Your Bookings</h2>
      <button 
        className="back-button" 
        onClick={() => navigate("/user-home")}  // Corrected navigation to the user-home page
        style={{
          padding: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          marginBottom: '20px'  // Space between the button and bookings list
        }}
      >
        ⬅ Back to Home
      </button>
      {loading && <p>Loading bookings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {bookings.map(booking => (
        <div
          key={booking._id}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: 'rgba(255, 253, 253, 0.7)', // Background color for each booking card
            borderRadius: '8px'
          }}
        >
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
    </div>
  );
};

export default UserBookingList;


//C:\Destop\it90\ITP1\ITP1\frontend\src\Bookkingpages\UserBookingList.js