import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css"; 

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <button className="home-login-btn" onClick={() => navigate("/login")}>
        Login
      </button>

      <div className="home-card">
        <h1>Welcome to Vk Aura</h1>
        <p className="intro-text">
          Vk Aura is your one-stop destination for Hindu Temple products,
          pooja items, and spiritual packages. We are committed to delivering
          authentic, traditional, and sacred items right to your doorstep.
        </p>

        <div className="image-gallery">
          <img src="/images/1.jpeg" alt="Temple Product 1" />
          <img src="/images/2.jpeg" alt="Temple Product 2" />
          <img src="/images/3.jpeg" alt="Temple Product 3" />
        </div>

        <div className="company-info">
          <h2>Contact Us</h2>
          <p><strong>Address:</strong> 123 Nallur, Jaffna, Srilanka</p>
          <p><strong>Phone:</strong> +94 76 774 9119 </p>
          <p><strong>Email:</strong> support@vkaura.lk</p>
        </div>
      </div>

      
      <footer className="footer">
        <p onClick={() => navigate("/feedback")}>Feedback</p>
        <p onClick={() => navigate("/terms")}>Terms & Conditions</p>
        <p onClick={() => navigate("/privacy")}>Privacy Policy</p>
      </footer>
    </div>
  );
};

export default HomePage;
