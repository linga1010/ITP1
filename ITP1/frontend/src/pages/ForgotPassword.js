import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    specialChar: false,
  });
  const navigate = useNavigate();
  const messageRef = useRef(null);

  // Function to scroll to the message container
  const scrollToMessage = () => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "newPassword") {
      validatePassword(e.target.value);
    }
  };

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Step 1: Check if Email Exists (Move to OTP Section if Exists)
  const checkForgotPasswordEmail = async () => {
    if (!formData.email) return setError("❌ Please enter an email.");

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/check-forgot-password-email", {
        email: formData.email,
      });

      if (res.data.exists) {
        console.log("Email found, proceeding to send OTP...");
        await sendForgotPasswordOTP();
      } else {
        setError("❌ Email not found. Please register first.");
        scrollToMessage();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error checking email.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Send OTP if Email Exists
  const sendForgotPasswordOTP = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      console.log("Sending OTP...");
      await axios.post("http://localhost:5000/api/users/send-forgot-password-otp", { email: formData.email });
      setMessage("✅ OTP sent to your email!");
      setStep(2);
      scrollToMessage();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOTP = async () => {
    if (!formData.otp) return setError("❌ Please enter OTP.");

    setMessage("");
    setError("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/users/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });

      setMessage("✅ OTP Verified!");
      setStep(3);
      scrollToMessage();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Invalid OTP.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleReset = async (e) => {
    e.preventDefault();

    // Clear previous messages and scroll to the message container
    setMessage("");
    setError("");
    scrollToMessage();

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("❌ Please fill in both password fields.");
      scrollToMessage();
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("❌ Passwords do not match.");
      scrollToMessage();
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      setError("❌ Password does not meet all security requirements.");
      scrollToMessage();
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/users/request-forgot-password", {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setMessage(res.data.message);
      scrollToMessage();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to reset password.");
      scrollToMessage();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-box">
          <h2>Forgot Password</h2>

          {/* Message container with ref */}
          <div ref={messageRef}>
            {message && <p className="message success">{message}</p>}
            {error && <p className="message error">{error}</p>}
          </div>

          {step === 1 && (
            <>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button type="button" className="btn" onClick={checkForgotPasswordEmail} disabled={loading}>
                {loading ? "Checking..." : "Next"}
              </button>
              <p className="step-container">
                Don't have an account? <a href="/signup">Signup here</a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                name="otp"
                className="input-field"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={handleChange}
                required
              />
              <button type="button" className="btn" onClick={verifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {step === 3 && (
            <form className="registration-form" onSubmit={handleReset}>
              <input
                type="password"
                name="newPassword"
                className="input-field"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <div className="password-criteria">
                <p>{passwordCriteria.length ? "✅" : "❌"} At least 8 characters</p>
                <p>{passwordCriteria.number ? "✅" : "❌"} At least 1 number (0-9)</p>
                <p>{passwordCriteria.lowercase ? "✅" : "❌"} At least 1 lowercase letter (a-z)</p>
                <p>{passwordCriteria.uppercase ? "✅" : "❌"} At least 1 uppercase letter (A-Z)</p>
                <p>{passwordCriteria.specialChar ? "✅" : "❌"} At least 1 special symbol (!@#$%^&*)</p>
              </div>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
