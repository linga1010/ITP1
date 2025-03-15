import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/UserHome.css';
import { useAuth } from "../hooks/useAuth"; 

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 

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
      <h1 className="home-title">Welcome to Vk Aura</h1>
      <p className="welcome-message">
        Welcome back, <strong>{user?.name || 'User'}</strong>
      </p>

      <div className="home-buttons">
        <button className="home-btn profile-btn" onClick={handleManageProfile}>Manage Profile</button>
        <button className="home-btn logout-btn" onClick={handleLogout}>Logout</button>
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
