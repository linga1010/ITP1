import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { message, Spin } from "antd";
import "./Payment.css";
import RatingModal from "./RatingModal";

const Payment = () => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    holderName: "",
    expiryDate: "",
    cvv: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const errorRef = useRef(null);

  const storedPrice = localStorage.getItem(`total_price_user_${user?._id}`);
  const totalPrice = storedPrice ? parseFloat(storedPrice) : 0;
  const cart = JSON.parse(localStorage.getItem(`cart_user_${user?._id}`)) || [];
  const location = localStorage.getItem(`location_user_${user?._id}`) || "";
  const storedPhone = localStorage.getItem(`phone_user_${user?._id}`) || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const validate = () => {
    const errors = {};
    if (!/^\d{16}$/.test(paymentData.cardNumber)) {
      errors.cardNumber = "Card number must be exactly 16 digits.";
    }
    if (!paymentData.holderName) {
      errors.holderName = "Card holder name is required.";
    }
    if (!paymentData.expiryDate) {
      errors.expiryDate = "Expiry date is required.";
    } else {
      const [year, month] = paymentData.expiryDate.split("-");
      const expiry = new Date(year, month - 1, 1);
      const now = new Date();
      now.setDate(1);
      if (expiry < now) {
        errors.expiryDate = "Expiry date cannot be in the past.";
      }
    }
    if (!/^\d{3}$/.test(paymentData.cvv)) {
      errors.cvv = "CVV must be exactly 3 digits.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(" "));
      setLoading(false);
      return;
    }

    if (!user || !user._id) {
      setError("User not found! Please log in again.");
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      message.error("Your cart is empty! Cannot proceed with payment.");
      setLoading(false);
      return;
    }

    try {
      // 1. Payment API
      const paymentResponse = await axios.post("http://localhost:5000/api/payment", {
        userId: user._id,
        userName: user.name,
        userPhone: storedPhone,
        items: cart,
        totalPrice,
        paymentMethod: "Card",
        cardNumber: paymentData.cardNumber,
        holderName: paymentData.holderName,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
      });

      if (paymentResponse.data.success) {
        // 2. Place Order after successful payment
        const orderResponse = await axios.post("http://localhost:5000/api/orders", {
          user: user.email,
          userName: user.name,
          userPhone: storedPhone,
          items: cart,
          total: totalPrice,
          location,
        });

        const newOrderId = orderResponse.data.order._id;
        setCreatedOrderId(newOrderId);

        // Clear cart from localStorage
        localStorage.removeItem(`cart_user_${user._id}`);
        localStorage.removeItem(`total_price_user_${user._id}`);
        localStorage.removeItem(`location_user_${user._id}`);
        localStorage.removeItem(`phone_user_${user._id}`);

        // ✅ Only one success message after both Payment and Order
        message.success("✅ Payment and Order placed successfully!");

        setRatingModalVisible(true); // Show Rating Modal
      } else {
        message.error(paymentResponse.data.message || "❌ Payment failed. Try again.");
      }
    } catch (err) {
      console.error("❌ Payment Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Payment failed. Please check your card details and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  return (
    <div className="payment-container">
      <h2>💳 Payment Page</h2>
      {error && <p ref={errorRef} className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Card Number</label>
        <input
          type="text"
          name="cardNumber"
          value={paymentData.cardNumber}
          onChange={handleChange}
          placeholder="16-digit card number"
          maxLength="16"
          required
        />

        <label>Card Holder Name</label>
        <input
          type="text"
          name="holderName"
          value={paymentData.holderName}
          onChange={handleChange}
          placeholder="Your name as on card"
          required
        />

        <label>Expiry Date</label>
        <input
          type="month"
          name="expiryDate"
          value={paymentData.expiryDate}
          onChange={handleChange}
          required
        />

        <label>CVV</label>
        <input
          type="text"
          name="cvv"
          value={paymentData.cvv}
          onChange={handleChange}
          placeholder="3-digit CVV"
          maxLength="3"
          required
        />

        <label>Total Price</label>
        <input type="text" value={`Rs.${totalPrice.toFixed(2)}`} readOnly />

        <button type="submit" disabled={loading}>
          {loading ? <Spin size="small" /> : "🛒 Pay Now"}
        </button>
      </form>

      {/* 🎯 Rating Modal */}
      {user && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => {
            setRatingModalVisible(false);
            navigate("/OrderHistoryDetails");
          }}
          userEmail={user.email}
          orderId={createdOrderId}
        />
      )}
    </div>
  );
};

export default Payment;
