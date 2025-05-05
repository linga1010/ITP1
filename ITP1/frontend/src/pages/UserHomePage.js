import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/UserHome.css";
import { useAuth } from "../hooks/useAuth";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaComments,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { Badge, Dropdown, Menu } from "antd";

const BASE_URL = "http://localhost:5000";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [priests, setPriests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [packageIndex, setPackageIndex] = useState(0);
  const [priestIndex, setPriestIndex] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchPriests();
  }, []);
  
  useEffect(() => {
    if (user && user._id) {
      fetchOffers();
    }
  }, [user]);
  

  const fetchPackages = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/packages`);
    setPackages(data);
  };

  const fetchPriests = async () => {
    const { data } = await axios.get(`${BASE_URL}/api/priests`);
    setPriests(data);
  };

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/offers`);
      setOffers(data || []);
      if (user && user._id) {
        const unread = data.filter((offer) => !offer.isReadBy.includes(user._id));
        setUnreadCount(unread.length);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const markAllAsRead = async () => {
    await axios.put(`${BASE_URL}/api/offers/mark-all-read/${user._id}`);
    fetchOffers();
  };

  const handleClickOffer = (pkgId) => {
    localStorage.setItem("highlightPackageId", pkgId);
    navigate("/view-package");
  };

  const offerMenuItems = offers.length > 0 ? [
    ...offers.map((offer) => ({
      key: offer._id,
      label: (
        <div
  key={offer._id}
  className={`offer-item ${offer.isReadBy.includes(user._id) ? "read" : "unread"}`}
  onClick={() => handleClickOffer(offer.packageId._id)}
>
  <strong>{offer.packageId.name}</strong>
  <p>{offer.offerMessage}</p>
</div>

      ),
    })),
    { type: 'divider' },
    {
      key: 'mark-all-read',
      label: (
        <div className="mark-read-bar" onClick={markAllAsRead}>
          <CheckOutlined /> Mark all as read
        </div>
      ),
    },
  ] : [
    {
      key: 'no-offers',
      label: <p className="no-offers">No offers available</p>,
      disabled: true,
    }
  ];

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/view-profile");
  };

  const handleChatClick = () => {
    navigate("/ChatPage");
  };

  const defaultProfilePicUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const getSlidingWindow = (array, currentIndex) => {
    const totalItems = array.length;
    if (totalItems === 0) return [];
    if (totalItems <= 4) return array;
    return [
      array[currentIndex % totalItems],
      array[(currentIndex + 1) % totalItems],
      array[(currentIndex + 2) % totalItems],
      array[(currentIndex + 3) % totalItems],
    ];
  };

  const displayedPackages = getSlidingWindow(packages, packageIndex);
  const displayedPriests = getSlidingWindow(priests, priestIndex);

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} onMouseEnter={() => setSidebarOpen(true)} onMouseLeave={() => setSidebarOpen(false)}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
        <Link to="/view-package" onClick={() => setSidebarOpen(false)}>Packages</Link>
        <Link to="/OrderHistoryDetails" onClick={() => setSidebarOpen(false)}>Order History</Link>
        <Link to="/Feedback" onClick={() => setSidebarOpen(false)}>Feedbacks</Link>
        <Link to="/about-us" onClick={() => setSidebarOpen(false)}>About Us</Link>
        <Link to="/user/booking-list" onClick={() => setSidebarOpen(false)}>Booking Details</Link>
        <Link to="/user/book-priest" onClick={() => setSidebarOpen(false)}>Book Priest</Link>
      </div>

      <header className="dashboard-header">
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
          </div>
          <div className="nav-center">
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#374495', margin: '20px 0', textAlign: 'center', letterSpacing: '1px' }}>
              WELCOME TO VK AURA, {user?.name?.toUpperCase() || "USER"}
            </p>
          </div>
          <div className="nav-right">
            <FaComments className="chat-icon" onClick={handleChatClick} />

            <div className="notification">
            <Dropdown menu={{ items: offerMenuItems }} trigger={["click"]} getPopupContainer={() => document.body} overlayClassName="dropdownbell">
              <Badge count={unreadCount} offset={[2, -4]}>
                <BellOutlined style={{ fontSize: 24, cursor: "pointer", color: "#374495" }} />
              </Badge>
            </Dropdown>
            </div>
            <div className="profile-wrapper" onClick={handleProfileClick}>
              <img src={user?.profilePic || defaultProfilePicUrl} alt="Profile" className="profile-photo" />
            </div>
            <button className="nav-btn logout-btn" onClick={() => setShowLogoutModal(true)}>Logout</button>
          </div>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="carousel-section">
          <div className="carousel-final-box">
            {/* Left Buttons */}
            <div className="side-buttons">
              <button className="side-arrow-button" onClick={() => setPackageIndex(prev => (prev - 1 + packages.length) % packages.length)}>&#8249;</button>
              <button className="side-arrow-button" onClick={() => setPackageIndex(prev => (prev + 1) % packages.length)}>&#8250;</button>
            </div>

            <div className="package-priest-container">
              {/* Package Card */}
              {packages.length > 0 && (
                <div className="package-card" onClick={() => navigate("/view-package")}>
                  <h3 className="card-heading">PACKAGES</h3>
                  <img src={packages[packageIndex]?.image || "#"} alt={packages[packageIndex]?.name || "Package"} className="package-image" />
                  <h4>{packages[packageIndex]?.name || "Package Name"}</h4>
                  <p>Price: Rs. {packages[packageIndex]?.totalPrice || "0"}</p>
                </div>
              )}

              {/* Priest Card */}
              {priests.length > 0 && (
                <div className="priest-card" onClick={() => navigate("/user/book-priest")}>
                  <h3 className="card-heading">PRIESTS</h3>
                  <img src={priests[priestIndex]?.photo ? `${BASE_URL}${priests[priestIndex].photo}` : "#"} alt={priests[priestIndex]?.name || "Priest"} className="priest-image" />
                  <h4>{priests[priestIndex]?.name || "Priest Name"}</h4>
                  <p>Daily Charge: Rs. {priests[priestIndex]?.dailyCharge || "0"}</p>
                </div>
              )}
            </div>

            {/* Right Buttons */}
            <div className="side-buttons">
              <button className="side-arrow-button" onClick={() => setPriestIndex(prev => (prev - 1 + priests.length) % priests.length)}>&#8249;</button>
              <button className="side-arrow-button" onClick={() => setPriestIndex(prev => (prev + 1) % priests.length)}>&#8250;</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          </div>
        </div>
      </footer>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="admin-logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="admin-logout-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-logout-emoji-animation">
              <img src="https://media1.tenor.com/m/G5NOmLUKGPIAAAAC/bola-amarilla.gif" alt="Sad Emoji" className="admin-logout-animated-emoji" />
            </div>
            <p>Are you sure you want to logout?</p>
            <div className="admin-logout-modal-buttons">
              <button className="admin-logout-yes-btn" onClick={confirmLogout}>Yes</button>
              <button className="admin-logout-no-btn" onClick={() => setShowLogoutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
