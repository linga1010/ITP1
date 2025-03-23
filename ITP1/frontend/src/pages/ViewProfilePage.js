// src/pages/ViewProfilePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

const ViewProfilePage = () => {
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch(() => setError('❌ Error fetching profile'));
  };

  const getCroppedImageUrl = (url) => {
    return url.replace('/upload/', '/upload/c_fill,w_150,h_150,g_face/');
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="profile-info centered-profile">
        <img
          src={user.profilePic ? getCroppedImageUrl(user.profilePic) : 'https://via.placeholder.com/150'}
          alt="Profile"
          className="profile-pic"
        />
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Address:</strong> {user.address}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>

      <div className="profile-actions">
        <button className="profile-btn" onClick={() => navigate('/user-home')}>⬅ Back to Dashboard</button>
        <button className="profile-btn" onClick={() => navigate('/profile')}>✏️ Edit Profile</button>
        <button className="profile-btn" onClick={() => navigate('/change-password')}>🔐 Change Password</button>
        <button className="profile-btn" onClick={() => navigate('/delete-account')}>🗑️ Delete Account</button>
      </div>
    </div>
  );
};

export default ViewProfilePage;
