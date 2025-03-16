import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyAdminAccess = async () => {
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
          setError('Access denied. Admins only.');
          navigate('/user-home'); // Or any other route for non-admin users
          return;
        }

        setUser(res.data);
      } catch (err) {
        console.error('Error verifying admin access:', err);
        setError('Failed to verify admin access');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [navigate]);

  const handleManageUsers = () => {
    navigate('/admin/manage-users');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <p>Loading Admin Dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <header className="header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, <strong>{user?.name || 'Admin'}</strong></p>
      </header>

      <div className="quick-access">
        <div className="card">
          <h3>Product Management</h3>
          <ul>
            <li><Link to="/add-product">Add New Product</Link></li>
            <li><Link to="/product-list">View All Products</Link></li>
          </ul>
        </div>

        <div className="card">
          <h3>Package Management</h3>
          <ul>
            <li><Link to="/add-package">Add Package</Link></li>
            <li><Link to="/packages">View All Packages</Link></li>
            <li><Link to="/view-package">All Packages</Link></li>
          </ul>
        </div>

        <div className="card">
          <h3>Invoice Management</h3>
          <ul>
            <li><Link to="/create-invoice">Create Invoice</Link></li>
            <li><Link to="/invoices">View All Invoices</Link></li>
          </ul>
        </div>
      </div>

      <div className="admin-buttons">
        <button onClick={handleManageUsers}>Manage Users</button>
        <button onClick={() => navigate('/admin/view-bookings')}>View Bookings</button>
        <button onClick={() => alert("View Priest Page coming soon!")}>View Priest</button>
        <button onClick={() => alert("View Rating Page coming soon!")}>View Rating</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
