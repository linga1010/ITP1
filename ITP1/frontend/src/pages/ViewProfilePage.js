// src/pages/ViewProfilePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ViewProfilePage.css';

const ViewProfilePage = () => {
  const [user, setUser] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUser(response.data))
      .catch(() => {
        setError('❌ Error fetching profile');
        localStorage.removeItem('token');
        navigate('/login');
      });
  };

  const handleBackToDashboard = () => {
    if (user.isAdmin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/user-home');
    }
  };

  const getCroppedImageUrl = (url) =>
    url.replace('/upload/', '/upload/c_fill,w_150,h_150,g_face/');

  return (
    <div className="view-profile-container">
      <h1 className="view-profile-title">Your Profile</h1>

      {error && <p className="view-error-message">{error}</p>}

      <div className="view-profile-info view-centered-profile">
        <img
          src={
            user.profilePic
              ? getCroppedImageUrl(user.profilePic)
              : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
          }
          alt="Profile"
          className="view-profile-pic"
        />
        <p className="view-profile-field">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="view-profile-field">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="view-profile-field">
          <strong>Address:</strong> {user.address}
        </p>
        <p className="view-profile-field">
          <strong>Phone:</strong> {user.phone}
        </p>
      </div>

      <div className="view-profile-actions">
        <button
          className="view-action-btn"
          onClick={() => navigate('/profile')}
        >
          ✏️ Edit Profile
        </button>
        <button
          className="view-action-btn"
          onClick={() => navigate('/change-password')}
        >
          🔐 Change Password
        </button>
        <button
          className="view-action-btn"
          onClick={() => navigate('/delete-account')}
        >
          🗑️ Delete Account
        </button>
        <button
          className="view-action-btn"
          onClick={handleBackToDashboard}
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ViewProfilePage;
