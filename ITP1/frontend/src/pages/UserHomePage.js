import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/UserHome.css';
import { useAuth } from "../hooks/useAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleManageProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="navbar-title">VK Aura</h1>
        <ul className="nav-links">
          <li><Link to="/feedback">Feedback</Link></li>
          <li><Link to="/booking">Booking</Link></li>
          <li><Link to="/order-history">Order History</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
          <li><Link to="/profile">Profile</Link></li> {/* Added Profile link */}
        </ul>

        {/* Logout Button on the Right */}
        <button className="logout-btn-nav" onClick={handleLogout}>Logout</button>
      </nav>

      <h1 className="home-title">Welcome to VK Aura</h1>
      <p className="welcome-message">
        Welcome back, <strong>{user?.name || 'User'}</strong>
      </p>

      <div className="home-buttons">
        <button className="home-btn profile-btn" onClick={handleManageProfile}>Manage Profile</button>
      </div>

      <ul>
        <li>
          <Link to="/view-package">All Packages</Link>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
