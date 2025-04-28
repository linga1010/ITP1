import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import UserDashboard from '../Component/Usercomponent';

const UserBookPriest = () => {
  const [event, setEvent] = useState('');
  const [date, setDate] = useState('');
  const [availablePriests, setAvailablePriests] = useState([]);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  const API_BASE_URL = 'http://localhost:5000';

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 60);
    return today.toISOString().split('T')[0];
  };

  const fetchAvailablePriests = async () => {
    if (!date) {
      setError('Please select a date first!');
      return;
    }

    const minDate = new Date(getMinDate());
    const maxDate = new Date(getMaxDate());
    const selectedDate = new Date(date);

    if (selectedDate < minDate || selectedDate > maxDate) {
      setError('The selected date must be between 7 and 60 days from today.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/priests/available?date=${date}`);
      setAvailablePriests(response.data);
      setAvailabilityChecked(true);
      setError('');
    } catch (error) {
      console.error('Error fetching available priests', error);
      setError('Failed to fetch available priests.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
   
    if (!event || event.length <= 5 || /[^a-zA-Z]/.test(event)) {
      setError('Event name must be more than 5 characters (no numbers or symbols).');
      return;
    }
    
    
    
    if (!date || !selectedPriest) {
      setError('Please complete all fields: Event, Date, and Priest selection.');
      return;
    }
    if (!user) {
      setError('You need to be logged in to book a priest.');
      return;
    }
  
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        priestId: selectedPriest,
        event,
        date,
      });
      alert('Priest booked successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error booking priest:', error.response?.data || error.message);
      if (error.response) {
        setError(`Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please check the backend.');
      } else {
        setError('An error occurred while making the request.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to book a priest.</p>;

  return (

    <div>

      <UserDashboard /> {/* Include the UserDashboard component */}
    
    <div
      className="user-book-priest-container"
      style={{
        backgroundColor: "rgba(255, 250, 250, 0.8)",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h2>Book a Priest</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Event:</label>
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            required
          />
        </div>
        <button type="button" onClick={fetchAvailablePriests} disabled={loading}>
          {loading ? 'Loading...' : 'Check Availability'}
        </button>

        {availabilityChecked && availablePriests.length === 0 && (
          <p>No priest available for the selected date.</p>
        )}

        {availablePriests.length > 0 && (
          <div>
            <h3>Available Priests</h3>
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Daily Charge</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {availablePriests.map((priest) => (
                  <tr key={priest._id}>
                    <td>
                      <img
                        src={`http://localhost:5000${priest.photo}`}
                        alt={priest.name}
                        width="50"
                      />
                    </td>
                    <td>{priest.name}</td>
                    <td>${priest.dailyCharge}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedPriest(priest._id)}
                        style={{
                          backgroundColor: selectedPriest === priest._id ? 'green' : '',
                          color: 'white',
                        }}
                      >
                        {selectedPriest === priest._id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" disabled={loading || !selectedPriest}>
              {loading ? 'Booking...' : 'Book Priest'}
            </button>
          </div>
        )}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Back Button with Corrected Navigation */}
      <button
        className="back-button"
        onClick={() => navigate('/user-home')} // Corrected navigate function
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px', // Adjusted spacing
        }}
      >
        ⬅ Back to Home
      </button>
    </div>
    </div>
  );
};

export default UserBookPriest;
