// src/pages/DeleteAccountPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/DeleteAccountPage.css';

const DeleteAccountPage = () => {
  const [deletePassword, setDeletePassword] = useState('');
  const [error,          setError]          = useState('');
  const [message,        setMessage]        = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      return setError('❌ Please enter your password to confirm deletion');
    }
    const token = localStorage.getItem('token');
    axios
      .delete('http://localhost:5000/api/users/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
        data:    { password: deletePassword },
      })
      .then(() => {
        setMessage('✅ Account deleted successfully');
        setError('');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch(err => {
        setError('❌ ' + (err.response?.data?.message || 'Error deleting account'));
        setMessage('');
      });
  };

  return (
    <div className="dap-container">
      <h1>Delete Account</h1>

      {message && <p className="dap-success">{message}</p>}
      {error   && <p className="dap-error">{error}</p>}

      <input
        type="password"
        className="dap-input"
        placeholder="Confirm Password to Delete"
        value={deletePassword}
        onChange={e => setDeletePassword(e.target.value)}
      />

      <div className="dap-button-group">
        <button
          className="dap-btn dap-delete-btn"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
        <button
          className="dap-btn dap-cancel-btn"
          onClick={() => navigate('/view-profile')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
