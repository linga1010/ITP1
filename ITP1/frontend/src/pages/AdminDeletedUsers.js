import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDeletedUser.css';
import Adminnaviagtion from "../Component/Adminnavigation"; 

const AdminDeletedUsers = () => {
  const navigate = useNavigate();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyAdminAndFetchDeletedUsers();
  }, []);

  const verifyAdminAndFetchDeletedUsers = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Verify admin status
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.isAdmin) {
        navigate('/login');
        return;
      }

      // Fetch deleted users if admin
      fetchDeletedUsers(token);
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchDeletedUsers = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/deleted-users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedUsers(res.data);
    } catch (err) {
      setError('❌ Failed to fetch deleted users.');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />

      <div className="maincontent">
    <div>
    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495', margin: '0px',marginBottom:'30PX', textAlign: 'center',letterSpacing: '1px' }}>
    Removed Users</p>
    
      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Reason</th>
            <th>Removed At</th>
          </tr>
        </thead>
        <tbody>
          {deletedUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address || 'No address available'}</td>
              <td>{user.reason}</td>
              <td>{new Date(user.deletedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    </div>
  );
};

export default AdminDeletedUsers;
