import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminUser.css';  // Ensure this path is correct based on your folder structure
import { useNavigate } from 'react-router-dom';

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const [userToDelete, setUserToDelete] = useState(null);  // Store the user ID to be deleted
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const fetchedUsers = res.data;
        const loggedInUserData = JSON.parse(localStorage.getItem('user'));
        setLoggedInUser(loggedInUserData);

        const normalUsers = fetchedUsers.filter(user => !user.isAdmin);
        const adminUsers = fetchedUsers.filter(user => user.isAdmin);

        setUsers(normalUsers);
        setAdmins(adminUsers);
      } catch (err) {
        setError('❌ Failed to fetch users.');
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId); // Set the user ID to delete
    setShowModal(true); // Show the confirmation modal
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('User successfully deleted');
      setUsers(users.filter((user) => user._id !== userToDelete));
      setShowModal(false); // Close the modal
    } catch (err) {
      alert('❌ Error deleting user');
      setShowModal(false); // Close the modal on error
    }
  };

  const cancelDelete = () => {
    setShowModal(false); // Close the modal without deleting
  };

  const handleGoToAdminDashboard = () => {
    navigate('/admin-dashboard'); // Navigate to the Admin Dashboard
  };

  return (
    <div>
      <h2>Manage Admins</h2>
      {error && <p>{error}</p>}

      {/* Admin Section */}
      <h3>Admin Details</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin._id}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td>{admin.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Manage Users Section */}
      <h3>Manage Users</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th> {/* Added Address column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address ? user.address : 'No address available'}</td> {/* Display address */}
              <td>
                {/* Show delete button only for users */}
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
            <div className="modal-footer">
              <button className="confirm" onClick={confirmDelete}>
                Delete
              </button>
              <button className="cancel" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button to navigate to Admin Dashboard */}
      <button className="go-back-btn" onClick={handleGoToAdminDashboard}>Go to Admin Dashboard</button>
    </div>
  );
};

export default AdminManageUsers;
