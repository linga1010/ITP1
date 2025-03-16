import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const AdminManagePriests = () => {
  const [priests, setPriests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = () => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:5000/api/admin/priests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setPriests(response.data);
      })
      .catch(() => {
        setError('❌ Error fetching priests');
      });
  };

  const handleDeletePriest = (priestId) => {
    const token = localStorage.getItem('token');
    axios
      .delete(`http://localhost:5000/api/admin/priests/${priestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        fetchPriests();
      })
      .catch(() => {
        setError('❌ Error deleting priest');
      });
  };

  return (
    <div>
      <h2>Manage Priests</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {priests.map((priest) => (
            <tr key={priest._id}>
              <td>{priest.name}</td>
              <td>{priest.email}</td>
              <td>
                <button onClick={() => handleDeletePriest(priest._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminManagePriests;
