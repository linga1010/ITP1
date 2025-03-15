import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook
import { useNavigate } from "react-router-dom";
import '../styles/Login.css';  // Import the enhanced CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For error messages
  const [loading, setLoading] = useState(false); // Loading state for the form
  const [successMessage, setSuccessMessage] = useState(""); // Success message after login
  const { login } = useAuth(); // Use the login function from the hook
  const navigate = useNavigate(); // To handle redirection after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error message
    setSuccessMessage(""); // Clear previous success message
  
    // Basic validation
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
  
    setLoading(true); // Start loading state
  
    try {
      const user = await login(email, password); // Call the login function from the hook
  
      if (user) {
        setSuccessMessage("Login successful!"); // Show success message
  
        // Wait for 2 seconds before redirecting
        setTimeout(() => {
          // Check if the logged-in user is an admin
          if (user.isAdmin) {
            // Redirect to the admin dashboard if admin
            navigate("/admin-dashboard");
          } else {
            // Redirect to the user home page if not admin
            navigate("/user-home");
          }
        }, 2000); // 2 seconds delay
      } else {
        setError("Invalid email or password."); // Use your original error message
      }
    } catch (error) {
      setError("Error during login."); // Use your original error message
    } finally {
      setLoading(false); // End loading after login attempt
    }
  };
  
  

  return (
    <div className="box">
      <div className="login">
        <div className="loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i>Login<i className="fa-solid fa-heart"></i>
          </h2>
          {/* Show error and success messages below the heading */}
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                id="email"
                name="email"
                required
              />
            </div>
            <div className="form-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                id="password"
                name="password"
                required
              />
            </div>
            <div className="form-field">
              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Logging in..." : "Login"}
              </button>
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
