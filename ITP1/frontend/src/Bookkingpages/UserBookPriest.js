import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserBookPriest = () => {
  const [event, setEvent] = useState('');
  const [date, setDate] = useState('');
  const [availablePriests, setAvailablePriests] = useState([]);
  const [selectedPriest, setSelectedPriest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Get the current date, and then calculate the range from 7 to 60 days
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // 7 days from now
    return today.toISOString().split('T')[0]; // Return date in yyyy-mm-dd format
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 60); // 60 days from now
    return today.toISOString().split('T')[0]; // Return date in yyyy-mm-dd format
  };

  const fetchAvailablePriests = async () => {
    if (!date) {
      setError('Please select a date first!');
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
    if (!event || !date || !selectedPriest) {
      setError('Please complete all fields: Event, Date, and Priest selection.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bookings`, {
        priestId: selectedPriest,
        event,
        date,
      });
      console.log('Booking response:', response);
      alert('Priest booked successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error booking priest:', error.response?.data || error.message);
      if (error.response) {
        // Backend error (status codes like 400, 500)
        setError(`Error: ${error.response.data?.error || 'Unknown error'}`);
      } else if (error.request) {
        // No response received from server
        setError('No response from server. Please check the backend.');
      } else {
        // Other errors (network issues, etc.)
        setError('An error occurred while making the request.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default UserBookPriest;
