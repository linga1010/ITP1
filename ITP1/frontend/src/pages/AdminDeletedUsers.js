import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const AdminDeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeletedUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/deleted-users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDeletedUsers(res.data);
      } catch (err) {
        setError('❌ Failed to fetch deleted users.');
      }
    };
    fetchDeletedUsers();
  }, []);

  return (
    <div>
      <h2>Deleted Users</h2>
      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Reason</th>
            <th>Deleted At</th>
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

      <button onClick={() => navigate('/admin-dashboard')}>Back to Admin Dashboard</button>
    </div>
  );
};

export default AdminDeletedUsers;
