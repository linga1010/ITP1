import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const handleManageUsers = () => {
    navigate('/admin/manage-users');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        <button onClick={() => alert("View Bookings Page coming soon!")}>View Bookings</button>
        <button onClick={() => alert("View Priest Page coming soon!")}>View Priest</button>
        <button onClick={() => alert("View Rating Page coming soon!")}>View Rating</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
