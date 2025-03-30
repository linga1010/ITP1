import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const { login, user } = useAuth(); // Removed getUser()
  const navigate = useNavigate(); 

  // 🔹 Check if user is already logged in and redirect accordingly
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && user) {
      if (user.isAdmin) {
        navigate("/admin-dashboard"); // Redirect admin users
      } else {
        navigate("/user-home"); // Redirect normal users
      }
    }
  }, [navigate, user]); // Removed getUser from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 

    if (!email || !password) {
      setError("❌ Please fill out all fields.");
      return;
    }
  
    try {
      const loggedInUser = await login(email, password); 

      if (loggedInUser) {
        // 🔹 Redirect based on `isAdmin` field
        if (loggedInUser.isAdmin) {
          navigate("/admin/view-profile");
        } else {
          navigate("/view-profile");
        }
      } else {
        setError("❌ Invalid email or password.");
      }
    } catch (error) {
      setError("❌ Error during login.");
    }
  };

  return (
    <div className="box">
      <div className="login">
        <div className="loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i> Login <i className="fa-solid fa-heart"></i>
          </h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="form-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="form-field">
              <button type="submit" className="login-btn">Login</button>
            </div>
          </form>
          <div className="group">
            <a href="/forgot-password">Forgot Password</a>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
