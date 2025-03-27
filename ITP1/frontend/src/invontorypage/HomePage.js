import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Admin</p>
      </header>

      <div className="quick-access">
        <div className="card">
          <h3>Product Management</h3>
          <ul>
            <li>
              <Link to="/add-product">Add New Product</Link>
            </li>
            <li>
              <Link to="/product-list">View All Products</Link>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Package Management</h3>
          <ul>
            <li>
              <Link to="/add-package">Add Package</Link>
            </li>
            <li>
              <Link to="/packages">View All Packages</Link>
            </li>
            <li>
              <Link to="/view-package">All Packages</Link>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Invoice Management</h3>
          <ul>
            <li>
              <Link to="/create-invoice">Create Invoice</Link>
            </li>
            <li>
              <Link to="/invoices">View All Invoices</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="analytics">
        <div className="card">
          <h3>Total Products</h3>
          <p>50</p>
        </div>
        <div className="card">
          <h3>Total Packages</h3>
          <p>30</p>
        </div>
        <div className="card">
          <h3>Total Invoices</h3>
          <p>100</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
