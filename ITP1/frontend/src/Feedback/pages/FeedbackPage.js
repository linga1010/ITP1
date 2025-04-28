import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getFeedbacks, addFeedback, updateFeedback, deleteFeedback, toggleLikeFeedback } from "../api";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackItem from "../components/FeedbackItem";
import { useAuth } from "../../hooks/useAuth";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaComments, FaBars, FaTimes } from "react-icons/fa";

const BASE_URL = "http://localhost:5000";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data);
    };

    fetchFeedbacks();
  }, [user, authLoading, navigate]);

  const handleAddFeedback = async (formData) => {
    try {
      const newFeedback = await addFeedback({ ...formData, userEmail: user.email });
      setFeedbacks((prev) => [...prev, newFeedback]);
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  const handleEditFeedback = async (id, formData) => {
    const updatedFeedback = await updateFeedback(id, formData, user.email);
    if (updatedFeedback) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? updatedFeedback : fb))
      );
      setEditing(null);
    }
  };

  const handleDeleteFeedback = async (id) => {
    const success = await deleteFeedback(id, user.email);
    if (success) {
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    }
  };

  const handleLikeFeedback = async (id) => {
    const updated = await toggleLikeFeedback(id, user.email);
    if (updated) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? updated : fb))
      );
    }
  };

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

  return (
    <div className="dashboard-container" style={{ 
      fontFamily: "Arial", 
      backgroundImage: "url('/your-background-image-path.jpg')", 
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      backgroundRepeat: "no-repeat", 
      minHeight: "100vh",
      marginTop:"30px",
    }}>
    
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <FaTimes />
        </button>
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
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#374495', margin: '20px 0', textAlign: 'center', letterSpacing: '1px' }}>
              WELCOME TO VK AURA, {user?.name?.toUpperCase() || "USER"}
            </p>
          </div>
          <div className="nav-right">
            <FaComments className="chat-icon" onClick={handleChatClick} />
            <div className="profile-wrapper" onClick={handleProfileClick}>
              <img
                src={user?.profilePic ? user.profilePic : defaultProfilePicUrl}
                alt="Profile"
                className="profile-photo"
              />
            </div>
            <button className="nav-btn logout-btn" onClick={() => setShowLogoutModal(true)}>
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-content" style={{ padding: "20px" }}>
      <div style={{ 
  maxWidth: "700px",
  margin: "40px auto",
  padding: "30px",
  borderRadius: "15px",
  background: "rgba(255, 255, 255, 0.75)",   // 🌟 Transparent white
  backdropFilter: "blur(10px)",               // 🌟 Blur background
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", // 🌟 Soft shadow
}}>

          <h2>Give Your Feedback</h2>

          {/* Feedback Form */}
          <FeedbackForm
            editFeedback={editing}
            setEditing={setEditing}
            onAdd={handleAddFeedback}
            onEdit={handleEditFeedback}
          />

          {/* Toggle View Button */}
          <button
            onClick={() => setIsFeedbackVisible(!isFeedbackVisible)}
            style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            {isFeedbackVisible ? "Hide Feedbacks" : "View Feedbacks"}
          </button>

          {/* Feedback List */}
          {isFeedbackVisible && (
            <>
              <h3 style={{ marginTop: "20px" }}>All Feedbacks</h3>
              {feedbacks.length === 0 ? (
                <p>No feedback available.</p>
              ) : (
                feedbacks.map((feedback) => (
                  <div key={feedback._id} style={{ marginBottom: "10px" }}>
                    <FeedbackItem
                      feedback={feedback}
                      canEdit={feedback.userEmail === user.email}
                      onEdit={() => setEditing(feedback)}
                      onDelete={() => handleDeleteFeedback(feedback._id)}
                      onLike={handleLikeFeedback}
                      userEmail={user.email}
                    />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: "40px" }}>
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

export default FeedbackPage;
