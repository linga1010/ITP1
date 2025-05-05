import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaComments, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import "../styles/ViewPackage.css";
import { Input, Button, Card, Row, Col, message } from "antd"

const BASE_URL = "http://localhost:5000";

const ViewPackage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/packages`)
      .then(res => setPackages(res.data || []))
      .catch(err => console.error("Package fetch error", err));
  }, []);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handlePlaceOrder = () => {
    navigate("/order");
  };

  const addToCart = (pkg) => {
    if (!user) {
      alert("Please log in to add items to the cart.");
      navigate("/login");
      return;
    }
  
    const cartKey = `cart_user_${user._id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItemIndex = cart.findIndex((item) => item._id === pkg._id);
  
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({ ...pkg, quantity: 1 });
    }
  
    localStorage.setItem(cartKey, JSON.stringify(cart));
    message.success(`${pkg.name} added to cart.`);
  };



  const renderProducts = (products) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      {products.map((product, index) => (
        <div
          key={index}
          style={{
            flex: "0 0 calc(50% - 12px)",
            background: "#f8f8f8",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ddd",
          }}
        >
          <strong>{product.productId.name}</strong><br />
          {product.quantity} {product.productId.unit}
        </div>
      ))}
    </div>
  );

  const handleChatClick = () => navigate("/ChatPage");
  const handleProfileClick = () => navigate("/view-profile");

  const defaultProfilePicUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
    <div className="view-package-page">
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <button className="close-btn" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
        <Link to="/view-package" onClick={() => setSidebarOpen(false)}>Packages</Link>
        <Link to="/OrderHistoryDetails" onClick={() => setSidebarOpen(false)}>Order History</Link>
        <Link to="/Feedback" onClick={() => setSidebarOpen(false)}>Feedbacks</Link>
        <Link to="/about-us" onClick={() => setSidebarOpen(false)}>About Us</Link>
        <Link to="/user/booking-list" onClick={() => setSidebarOpen(false)}>Booking Details</Link>
        <Link to="/user/book-priest" onClick={() => setSidebarOpen(false)}>Book Priest</Link>
      </div>

      {/* Navbar */}
      <header className="dashboard-header">
        <nav className="navbar">
          <div className="nav-left">
            <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
          </div>
          <div className="nav-center">
            <p className="nav-title">WELCOME TO VK AURA, {user?.name?.toUpperCase() || "USER"}</p>
          </div>
          <div className="nav-right">
            <FaComments className="chat-icon" onClick={handleChatClick} />
            <div className="profile-wrapper" onClick={handleProfileClick}>
              <img
                src={user?.profilePic || defaultProfilePicUrl}
                alt="Profile"
                className="profile-photo"
              />
            </div>
            <button className="nav-btn logout-btn" onClick={() => setShowLogoutModal(true)}>Logout</button>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="package-list-content">
        <h2 className="page-title">User Package List</h2>
        <div className="package-grid">
          {packages.map((pkg, idx) => (
            <div className="package-card" key={idx}>
              <img src={pkg.image || "/default.jpg"} alt="Package" className="package-image" />
              <h3>{pkg.name}</h3>
              <div className="product-list">

              {pkg.products?.map((prod, i) => (
           <div key={i} className="product-item">
          {prod.productId.name} – {prod.quantity} {prod.productId.unit}
        </div>
        ))}
        
              </div>
              <p><strong>Total Price:</strong> Rs. {pkg.totalPrice}</p>
              <p><strong>Discount:</strong> {pkg.discount}%</p>
              <p><strong>Final Price:</strong> Rs. {pkg.finalPrice}</p>
              <div className="button-group">
              <button className="add-to-cart-btn" onClick={() => addToCart(pkg)}>Add to Cart</button>

                <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a href="https://facebook.com" target="_blank"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank"><FaLinkedin /></a>
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

export default ViewPackage;
