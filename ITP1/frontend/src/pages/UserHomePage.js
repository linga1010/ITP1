import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/UserHome.css';
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Get user from useAuth

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleManageProfile = () => {
    navigate('/view-profile');
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="user-navbar">
        <button className="home-btn profile-btn" onClick={handleManageProfile}>Manage Profile</button>
        <ul className="nav-links">
          <li><Link to="/user-home">Homepage</Link></li>
          <li><Link to="/view-package">Packages</Link></li>
          <li><Link to="/OrderHistoryDetails">Order History</Link></li>
          <li><Link to="/Feedback">Feedbacks</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
          <li><Link to="/user/booking-list">Bokking Details </Link></li>
          <li><Link to="/user/book-priest">Book Priest</Link></li>
        </ul>
        <button className="home-btn logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      <br/>
      <h1 className="home-title">Welcome to Vk Aura</h1>
      <p className="welcome-message">
        Welcome back, <strong>{user?.name || 'User'}</strong>
      </p>

      
    </div>
  );
};

export default HomePage;
