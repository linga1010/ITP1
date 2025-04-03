import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/UserHome.css";
import { useAuth } from "../hooks/useAuth";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // Social media icons

const BASE_URL = "http://localhost:5000";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [priests, setPriests] = useState([]);
  const [packageIndex, setPackageIndex] = useState(0);
  const [priestIndex, setPriestIndex] = useState(0);

  useEffect(() => {
    fetchPackages();
    fetchPriests();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/packages`);
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  const fetchPriests = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/priests`);
      setPriests(data || []);
    } catch (error) {
      console.error("Error fetching priests:", error);
    }
  };

  useEffect(() => {
    const packageInterval = setInterval(() => {
      if (packages.length) {
        setPackageIndex((prevIndex) => (prevIndex + 1) % packages.length);
      }
    }, 1500);
    return () => clearInterval(packageInterval);
  }, [packages]);

  useEffect(() => {
    const priestInterval = setInterval(() => {
      if (priests.length) {
        setPriestIndex((prevIndex) => (prevIndex + 1) % priests.length);
      }
    }, 1500);
    return () => clearInterval(priestInterval);
  }, [priests]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/view-profile");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <nav className="navbar">
          <div className="nav-center">
            <ul className="nav-links">
              <li className="nav-item123">
                <Link to="/view-package">Packages</Link>
              </li>
              <li className="nav-item123" >
                <Link to="/OrderHistoryDetails">Order History</Link>
              </li>
              <li className="nav-item123">
                <Link to="/Feedback">Feedbacks</Link>
              </li>
              <li className="nav-item123">
                <Link to="/about-us">About Us</Link>
              </li>
              <li className="nav-item123">
                <Link to="/user/booking-list">Booking Details</Link>
              </li>
              <li className="nav-item123">
                <Link to="/user/book-priest">Book Priest</Link>
              </li>
             
            </ul>
          </div>
          <div className="nav-right">

          <div className="profile-wrapper" onClick={handleProfileClick}>
                <img
                  src={
                    user?.profilePic
                      ? user.profilePic
                      : "https://via.placeholder.com/50"
                  }
                  alt="Profile"
                  className="profile-photo"
                />
              </div>

            <button className="nav-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
        <div className="welcome-text">
          <h1>Welcome to Vk Aura</h1>
          <p>
            Welcome back, <strong>{user?.name || "User"}</strong>
          </p>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="carousel-section">
          <p className="carousel-heading">Packages</p>
          <div className="carousel-container">
            <button
              className="arrow-button"
              onClick={() =>
                setPackageIndex((prevIndex) =>
                  packages.length
                    ? (prevIndex - 1 + packages.length) % packages.length
                    : 0
                )
              }
            >
              &#8249;
            </button>
            <div className="package-section">
              {displayedPackages.length > 0 ? (
                displayedPackages.map((pkg, idx) => (
                  <div
                    key={pkg?._id || idx}
                    className="package-card"
                    onClick={() => navigate("/view-package")}
                  >
                    <img
                      src={pkg?.image ? `${BASE_URL}${pkg.image}` : "#"}
                      alt={pkg?.name || "Package"}
                      className="package-image"
                    />
                    <h3>{pkg?.name || "Package Name"}</h3>
                    <p>Price: Rs. {pkg?.totalPrice || "0"}</p>
                  </div>
                ))
              ) : (
                <p>Loading packages...</p>
              )}
            </div>
            <button
              className="arrow-button"
              onClick={() =>
                setPackageIndex((prevIndex) =>
                  packages.length ? (prevIndex + 1) % packages.length : 0
                )
              }
            >
              &#8250;
            </button>
          </div>
        </section>

        <section className="carousel-section">
          <p className="carousel-heading">Priests</p>
          <div className="carousel-container">
            <button
              className="arrow-button"
              onClick={() =>
                setPriestIndex((prevIndex) =>
                  priests.length
                    ? (prevIndex - 1 + priests.length) % priests.length
                    : 0
                )
              }
            >
              &#8249;
            </button>
            <div className="priest-section">
              {displayedPriests.length > 0 ? (
                displayedPriests.map((priest, idx) => (
                  <div
                    key={priest?._id || idx}
                    className="priest-card"
                    onClick={() => navigate("/user/book-priest")}
                  >
                    <img
                      src={priest?.photo ? `${BASE_URL}${priest.photo}` : "#"}
                      alt={priest?.name || "Priest"}
                      className="priest-image"
                    />
                    <h3>{priest?.name || "Priest Name"}</h3>
                    <p>Daily Charge: Rs. {priest?.dailyCharge || "0"}</p>
                  </div>
                ))
              ) : (
                <p>Loading priests...</p>
              )}
            </div>
            <button
              className="arrow-button"
              onClick={() =>
                setPriestIndex((prevIndex) =>
                  priests.length ? (prevIndex + 1) % priests.length : 0
                )
              }
            >
              &#8250;
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 VK Aura. All rights reserved.</p>
          <div className="social-media">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
