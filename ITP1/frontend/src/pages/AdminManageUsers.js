import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminUser.css';

const AdminManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    verifyAdminAndFetchUsers();
  }, []);

  const verifyAdminAndFetchUsers = async () => {
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

      // Fetch users if admin
      fetchUsers(token);
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedUsers = res.data;
      setLoggedInUser(JSON.parse(localStorage.getItem('user')));

      setUsers(fetchedUsers.filter((user) => !user.isAdmin));
      setAdmins(fetchedUsers.filter((user) => user.isAdmin));
    } catch (err) {
      setError('❌ Failed to fetch users.');
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deletionReason) {
      alert('❌ Please provide a reason for deleting the user.');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { reason: deletionReason },
      });

      alert('User successfully deleted');
      setUsers(users.filter((user) => user._id !== userToDelete));
      setShowModal(false);
    } catch (err) {
      alert('❌ Error deleting user');
      setShowModal(false);
    }
  };

  return (
    <div>
      <h2>Manage Admins</h2>
      {error && <p>{error}</p>}

      <h3>Admin Details</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin._id}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.phone}</td>
              <td>{admin.address || 'No address available'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Manage Users</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address || 'No address available'}</td>
              <td>
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for confirmation */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Are you sure you want to delete this user?</h4>
            </div>
            <div className="modal-body">
              <textarea
                placeholder="Enter reason for deletion"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button className="confirm" onClick={confirmDelete}>
                Delete
              </button>
              <button className="cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="go-back-btn" onClick={() => navigate('/admin-dashboard')}>
        Go to Admin Dashboard
      </button>
    </div>
  );
};

export default AdminManageUsers;
