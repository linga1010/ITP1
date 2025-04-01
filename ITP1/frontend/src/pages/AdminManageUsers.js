import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminUser.css';
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const AdminManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }, // Corrected string interpolation here
      });

      if (!res.data.isAdmin) {
        navigate('/login');
        return;
      }

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
        headers: { Authorization: `Bearer ${token}` }, // Corrected string interpolation here
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
      await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete}`, { // Corrected URL string interpolation here
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Corrected string interpolation here
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

  // Function to show user details in modal
  const viewUserDetails = async (user) => {
    try {
      // Fetch booking & purchase details (Mocked for now)
      const bookingHistory = [
        { id: 'B123', date: '2025-03-15', amount: '$100' },
        { id: 'B124', date: '2025-03-20', amount: '$50' },
      ];

      const purchaseHistory = [
        { id: 'P987', date: '2025-03-10', item: 'Premium Plan', price: '$20' },
        { id: 'P988', date: '2025-03-18', item: 'Gift Card', price: '$10' },
      ];

      setSelectedUser({ ...user, bookingHistory, purchaseHistory });
      setShowUserModal(true);
    } catch (err) {
      alert('❌ Error fetching user details');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />

      <div className="main-content">
        <h2>Manage Users</h2>
        {error && <p>{error}</p>}

        <table>
          <thead>
            <tr>
              <th>Profile</th>
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
                <td>
                  <img
                    src={user.profilePic || defaultProfilePicUrl}
                    alt={user.name}
                    className="user-profile-pic"
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.address || 'No address available'}</td>
                <td>
                  <button onClick={() => viewUserDetails(user)}>View</button>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowUserModal(false)}>×</span>
              <h3>User Details</h3>
              <img
                src={selectedUser.profilePic || defaultProfilePicUrl}
                alt={selectedUser.name}
                className="user-profile-pic-large"
              />
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Address:</strong> {selectedUser.address || 'No address available'}</p>

              <h4>Booking History</h4>
              <ul>
                {selectedUser.bookingHistory.map((booking) => (
                  <li key={booking.id}>{booking.date} - {booking.amount}</li>
                ))}
              </ul>

              <h4>Purchase History</h4>
              <ul>
                {selectedUser.purchaseHistory.map((purchase) => (
                  <li key={purchase.id}>{purchase.date} - {purchase.item} ({purchase.price})</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button className="go-back-btn" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminManageUsers;
