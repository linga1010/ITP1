import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook
import '../styles/Login.css'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [successMessage, setSuccessMessage] = useState(""); 
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccessMessage(""); 
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
  
    try {
      const user = await login(email, password); 

      if (user) {
      } else {
        setError("Invalid email or password.");
      }
    } catch (error) {
      setError("Error during login.");
    }
  };

  return (
    <div className="box">
      <div className="login">
        <div className="loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i>Login<i className="fa-solid fa-heart"></i>
          </h2>
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
              <button type="submit" className="login-btn">
                Login
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
