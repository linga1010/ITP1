import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // or VkLogin.css if you renamed it

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already-logged-in users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      if (user.isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-home");
      }
    }
  }, [navigate, user]);

  // Auto-clear error messages after 3 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [error]);

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
        if (loggedInUser.isAdmin) {
          navigate("/admin/view-profile");
        } else {
          navigate("/view-profile");
        }
      } else {
        setError("❌ Invalid email or password.");
      }
    } catch (err) {
      setError("❌ Error during login.");
    }
  };

  return (
    <div className="vk-box">
      <div className="vk-login">
        <div className="vk-loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i> Login{" "}
            <i className="fa-solid fa-heart"></i>
          </h2>
          {error && <div className="vk-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="vk-login-form">
            <div className="vk-form-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="vk-form-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="vk-form-field">
              <button type="submit" className="vk-login-btn">
                Login
              </button>
            </div>
          </form>
          <div className="vk-group">
            <a href="/forgot-password">Forgot Password</a>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
