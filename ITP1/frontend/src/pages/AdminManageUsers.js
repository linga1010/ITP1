import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminUser.css';
//import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation"; 

const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

// map statuses to CSS class names
const statusClassMap = {
  pending: 'status-pending',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  removed: 'status-removed',
  canceled: 'status-canceled',
  success: 'status-success',
};

const AdminManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // search query state
  const modalRef = useRef();

  useEffect(() => {
    verifyAdminAndFetchUsers();

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowUserModal(false);
        setShowDeleteModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // filtered lists based on search query (ignore case)
  const filteredAdmins = admins.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.phone.toLowerCase().includes(term) ||
      (a.address && a.address.toLowerCase().includes(term))
    );
  });
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term) ||
      (u.address && u.address.toLowerCase().includes(term))
    );
  });

  const verifyAdminAndFetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedUsers = res.data;
      setLoggedInUser(JSON.parse(localStorage.getItem('user')));
      setUsers(fetchedUsers.filter((u) => !u.isAdmin));
      setAdmins(fetchedUsers.filter((u) => u.isAdmin));
    } catch (err) {
      setError('❌ Failed to fetch users.');
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
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
      setUsers(users.filter((u) => u._id !== userToDelete));
      setShowDeleteModal(false);
      setDeletionReason('');
    } catch (err) {
      alert('❌ Error deleting user');
      setShowDeleteModal(false);
    }
  };

  const viewUserDetails = async (user) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders`);
      const orderHistory = res.data.filter(o => o.user === user.email);
      setSelectedUser({ ...user, orderHistory });
      setShowUserModal(true);
    } catch (err) {
      alert('❌ Error fetching user order details');
    }
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />

      <div className="maincontent">
        <h1>Manage Users</h1>
        {/* summary counts */}
        <div className="summary">
          <p>Total Admins: {admins.length}</p>
          <p>Total Users: {users.length}</p>
        </div>
        {/* search box */}
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, phone, address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {error && <p className="error-text">{error}</p>}

        {/* Admins */}
        <h3>Admins</h3>
        <table className="standard-table">
          <thead>
            <tr>
              <th>Profile</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map(a => (
              <tr key={a._id}>
                <td><img src={a.profilePic || defaultProfilePicUrl} alt={a.name} className="user-profile-pic" /></td>
                <td>{a.name}</td><td>{a.email}</td><td>{a.phone}</td>
                <td>{a.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Users */}
        <h3>Users</h3>
        <table className="standard-table">
          <thead>
            <tr>
              <th>Profile</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td><img src={u.profilePic || defaultProfilePicUrl} alt={u.name} className="user-profile-pic" /></td>
                <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
                <td>{u.address || '—'}</td>
                <td>
                  <button className="admin-user-btn" onClick={() => viewUserDetails(u)}>View</button>
                  <button className="admin-user-btn cancel" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="modal">
            <div className="modal-content" ref={modalRef}>
              <span className="close" onClick={() => setShowUserModal(false)}>×</span>
              <h3>User Details</h3>
              <div className="user-info">
                <img src={selectedUser.profilePic || defaultProfilePicUrl}
                     alt={selectedUser.name}
                     className="user-profile-pic-large" />
                <div className="user-fields">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone}</p>
                  <p><strong>Address:</strong> {selectedUser.address || '—'}</p>
                </div>
              </div>

              <h3>Order History</h3>
              <div className="order-history">
                {selectedUser.orderHistory.length > 0 ? selectedUser.orderHistory.map(order => {
                  const computedTotal = order.items.reduce(
                    (sum, it) => sum + it.finalPrice * it.quantity, 0
                  );
                  const statusClass = statusClassMap[order.status.toLowerCase()] || '';
                  return (
                    <div className="order-card" key={order._id}>
                      <div className="order-header">
                        <span className="order-id">Order #{order._id}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Name</th><th>Price</th><th>Qty</th><th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i}>
                              <td>{item.name}</td>
                              <td>Rs.{item.finalPrice}</td>
                              <td>{item.quantity}</td>
                              <td>Rs.{item.finalPrice * item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="order-footer">
                        <span className={`order-status ${statusClass}`}>Status: {order.status}</span>
                        <span className="order-final-total">Final Total: Rs.{computedTotal}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="no-orders">No orders found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal">
            <div className="modal-content" ref={modalRef}>
              <span className="close" onClick={() => setShowDeleteModal(false)}>×</span>
              <h3>Confirm Delete</h3>
              <textarea
                placeholder="Reason for deletion"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
              />
              <div className="modal-actions">
                <button className="admin-user-btn" onClick={confirmDelete}>Confirm</button>
                <button className="admin-user-btn cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
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
