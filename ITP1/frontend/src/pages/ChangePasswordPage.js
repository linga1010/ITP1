import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('❌ All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('❌ Passwords do not match');
      return;
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("❌ Password does not meet all security requirements.");
      return;
    }

    const token = localStorage.getItem('token');
    axios
      .put(
        'http://localhost:5000/api/users/change-password',
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage('✅ Password updated successfully');
        setError('');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      })
      .catch((error) => {
        setError('❌ ' + (error.response?.data?.message || 'Error updating password'));
        setMessage('');
      });
  };

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    validatePassword(e.target.value);
  };

  return (
    <div className="profile-container">
      <h1>Change Password</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <input
        type="password"
        className="profile-input"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        className="profile-input"
        placeholder="New Password"
        value={newPassword}
        onChange={handleNewPasswordChange} // Call the new function here
      />
      <div className="password-criteria">
        <p>{passwordCriteria.length ? "✅" : "❌"} At least 8 characters</p>
        <p>{passwordCriteria.number ? "✅" : "❌"} At least 1 number (0-9)</p>
        <p>{passwordCriteria.lowercase ? "✅" : "❌"} At least 1 lowercase letter (a-z)</p>
        <p>{passwordCriteria.uppercase ? "✅" : "❌"} At least 1 uppercase letter (A-Z)</p>
        <p>{passwordCriteria.specialChar ? "✅" : "❌"} At least 1 special symbol (!@#$%^&*)</p>
      </div>
      <input
        type="password"
        className="profile-input"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button className="profile-btn save-btn" onClick={handleChangePassword}>Update Password</button>
      <button className="profile-btn cancel-btn" onClick={() => navigate('/profile')}>Cancel</button>
    </div>
  );
};

export default ChangePasswordPage;