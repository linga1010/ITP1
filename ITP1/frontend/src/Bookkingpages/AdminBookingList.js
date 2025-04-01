import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnaviagtion from "../Component/Adminnavigation";

const AdminBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriest, setSelectedPriest] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);

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

  // Filter bookings by selected priest and date, and search query
  useEffect(() => {
    let filtered = [...bookings];

    // Filter out bookings for today and earlier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter(
      booking => new Date(booking.date).getTime() > today.getTime()
    );

    // Filter by priest name using searchQuery if provided
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.priest &&
        booking.priest.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected priest if provided
    if (selectedPriest) {
      filtered = filtered.filter(
        booking => booking.priest && booking.priest._id === selectedPriest
      );
    }

    // Filter by selected date if provided
    if (selectedDate) {
      filtered = filtered.filter(
        booking =>
          new Date(booking.date).toLocaleDateString() ===
          new Date(selectedDate).toLocaleDateString()
      );
    }

    // Sort bookings by date (upcoming bookings first)
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredBookings(filtered);
  }, [bookings, searchQuery, selectedPriest, selectedDate]);

  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data.error || 'Error cancelling booking');
    }
  };

  // Create a unique list of priests for the filter dropdown.
  const priestOptions = bookings
    .map(booking => booking.priest)
    .filter(priest => priest !== null) // Filter out null values
    .reduce((unique, priest) => {
      if (!unique.some(item => item._id === priest._id)) {
        unique.push(priest);
      }
      return unique;
    }, []);

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <h2>Admin - Booking Details</h2>
        
        <div>
          <label>Search Priest by Name:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search priest name"
          />
        </div>

        <div>
          <label>Select Priest:</label>
          <select 
            onChange={(e) => setSelectedPriest(e.target.value)} 
            value={selectedPriest}
          >
            <option value="">-- All Priests --</option>
            {priestOptions.map(priest => (
              <option key={priest._id} value={priest._id}>
                {priest.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <h3>Booking Details</h3>
          {filteredBookings.length === 0 && <p>No bookings found for this filter</p>}
          {filteredBookings.map((booking) => (
            <div key={booking._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h4>{booking.event}</h4>
              <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
              <p>Priest: {booking.priest ? booking.priest.name : 'N/A'}</p>
              <p>Status: {booking.status}</p>
              {booking.status === 'Booked' && (
                <button onClick={() => handleCancelBooking(booking._id)}>
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingList;
