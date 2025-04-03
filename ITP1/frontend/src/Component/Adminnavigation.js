import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';  // Added useLocation
import { useAuth } from '../hooks/useAuth';
import { FaArrowLeft, FaSignOutAlt, FaBars } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Adminnaviagation.css';
import '../styles/AdminDashboard.css';

const Adminnaviagtion = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Added useLocation
  const { user } = useAuth();

  const [openSections, setOpenSections] = useState({
    'Home': false,
    'User Management': false,
    'Inventory Management': false,
    'Order Management': false,
    'Booking Management': false,
    'Feedback Management': false,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
          navigate('/user-home');
          return;
        }
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

  const handleToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarItems = [
    {
      title: 'Home',
      links: [
        { to: '/admin-dashboard', label: 'Admin Dashboard' },
      ],
    },
    {
      title: 'User Management',
      links: [
        { to: '/admin/manage-users', label: 'Manage Users' },
        { to: '/admin/deleted-users', label: 'Deleted User' },
        { to: '/admin/view-profile', label: 'Admin Profile' },


      ],
    },
    {
      title: 'Inventory Management',
      links: [
        { to: '/add-product', label: 'Add New Product' },
        { to: '/product-list', label: 'View All Products' },
        { to: '/add-package', label: 'Add Package' },
        { to: '/packages', label: 'View All Packages' },
        { to: '/create-invoice', label: 'Create Invoice' },
        { to: '/invoices', label: 'View All Invoices' },
        { to: '/purchases/create', label: 'Create the bill' },
        { to: '/purchases', label: 'View all bill' },
        

      ],
    },
    {
      title: 'Order Management',
      links: [
        { to: '/admin/view-bookings', label: 'View Order Bookings' },
        { to: '/admin/viewPayment', label: 'View Order Payments' },
      ],
    },
    {
      title: 'Booking Management',
      links: [
  
        { to: '/admin/add-priest', label: 'Add Priest' },
        { to: '/admin/priest-list', label: 'View All Priests' },
        { to: '/admin/booking-list', label: 'View Bookings' },
      
      ],
    },
    {
      title: 'Feedback Management',
      links: [
        { to: '/adminFeedback', label: 'View Feedback' },
        
      ],
    },
  ];

  // Back button component with check for /login
  const BackButton = () => {
    const handleBack = () => {
      // If the current location is '/login', don't allow going back
      if (location.pathname === '/admin-dashboard') {
        return;
      }
      // Otherwise, navigate back to the previous page
      navigate(-1);
    };

    return (
      <button className="back-btn" onClick={handleBack}>
        <FaArrowLeft /> Back
      </button>
    );
  };

  if (loading) return <p>Loading Admin Dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <header className="navbar">
      <div className="navbar-right">
        <button className="hamburger-icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <FaBars />
        </button>
        
          <BackButton />
          <p>Welcome back, <strong>{user?.name || 'Admin'}</strong></p>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <h2 className="Admin" >Admin</h2>
        <ul className="sidebar-menu">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <button className="sidebar-toggle" onClick={() => handleToggle(item.title)}>
                {item.title}
              </button>
              {openSections[item.title] && (
                <ul className="nested-menu">
                  {item.links.map((link, idx) => (
                    <li key={idx}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
};

export default Adminnaviagtion;
