import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setError('❌ Error fetching profile');
        setMessage('');
      });
  };

  const handleUpdate = (field) => {
    setMessage('');
    setError('');

    if (field === 'phone') {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(newPhone)) {
        setError('❌ Invalid phone number format, Phone must be 10 digits and start with 0');
        return;
      }
    }

    const token = localStorage.getItem('token');
    const updatedData = {
      [field]: field === 'name' ? newName : field === 'address' ? newAddress : newPhone,
    };

    axios
      .put('http://localhost:5000/api/users/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
        setError('');
        fetchProfile();
        if (field === 'name') setIsEditingName(false);
        if (field === 'address') setIsEditingAddress(false);
        if (field === 'phone') setIsEditingPhone(false);
      })
      .catch(() => {
        setError(`❌ Error updating ${field}`);
        setMessage('');
      });
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="profile-info">
      <p><strong>Email:</strong> {user.email}</p>

        <p><strong>Name:</strong> {user.name}</p>
        {isEditingName ? (
          <div>
            <input
              type="text"
              placeholder="New Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={() => handleUpdate('name')}>Confirm</button>
            <button onClick={() => setIsEditingName(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewName(user.name); setIsEditingName(true); }}>Change Name</button>
        )}


        <p><strong>Address:</strong> {user.address}</p>
        {isEditingAddress ? (
          <div>
            <input
              type="text"
              placeholder="New Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <button onClick={() => handleUpdate('address')}>Confirm</button>
            <button onClick={() => setIsEditingAddress(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewAddress(user.address); setIsEditingAddress(true); }}>Change Address</button>
        )}

        <p><strong>Phone:</strong> {user.phone}</p>
        {isEditingPhone ? (
          <div>
            <input
              type="number"
              placeholder="New Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <button onClick={() => handleUpdate('phone')}>Confirm</button>
            <button onClick={() => setIsEditingPhone(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewPhone(user.phone); setIsEditingPhone(true); }}>Change Phone</button>
        )}
      </div>

      <button className="profile-btn back-btn" onClick={() => navigate('/user-home')}>⬅ Back to Home</button>
      <button className="profile-btn change-password-btn" onClick={() => navigate('/change-password')}>Change Password</button>
      <button className="profile-btn delete-account-btn" onClick={() => navigate('/delete-account')}>Delete Account</button>
    </div>
  );
};

export default ProfilePage;
