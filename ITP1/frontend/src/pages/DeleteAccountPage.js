import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css'; // Ensure this file exists

const DeleteAccountPage = () => {
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      setError('❌ Please enter your password to confirm account deletion');
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .delete('http://localhost:5000/api/users/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword },
      })
      .then(() => {
        setMessage('✅ Account deleted successfully');
        setError('');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      })
      .catch((error) => {
        setError('❌ ' + (error.response?.data?.message || 'Error deleting account'));
        setMessage('');
      });
  };

  return (
    <div className="profile-container">
      <h1>Delete Account</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <input
        type="password"
        className="profile-input"
        placeholder="Confirm Password to Delete"
        value={deletePassword}
        onChange={(e) => setDeletePassword(e.target.value)}
      />

      <button className="profile-btn delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
      <button className="profile-btn cancel-btn" onClick={() => navigate('/view-profile')}>Cancel</button>
    </div>
  );
};

export default DeleteAccountPage;
