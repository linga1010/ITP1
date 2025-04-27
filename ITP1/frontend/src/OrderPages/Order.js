import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input, message, Checkbox, Modal } from "antd";
import { useAuth } from "../hooks/useAuth";
import "./Order.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");  // ✨ ADD THIS

  useEffect(() => {
    if (!user) return;
    const storedCart = JSON.parse(localStorage.getItem(`cart_user_${user._id}`)) || [];
    setCart(storedCart);
    setPhone(user?.phone || ""); // ✨ Set initial phone
  }, [user]);

  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0).toFixed(2);

  const handleQuantityChange = (id, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) {
      message.error("Quantity cannot be less than 1");
      qty = 1;
    } else if (qty > 25) {
      message.error("Quantity cannot be more than 25");
      qty = 25;
    }
    const updated = cart.map(i => (i._id === id ? { ...i, quantity: qty } : i));
    setCart(updated);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updated));
  };

  const handleRemoveFromCart = id => {
    const updated = cart.filter(i => i._id !== id);
    setCart(updated);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updated));
  };

  const handlePay = () => {
    if (!user) {
      message.error("❌ User not logged in! Please log in to continue.");
      navigate("/login");
      return;
    }
    if (cart.length === 0) {
      message.error("Your cart is empty!");
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmLocation = () => {
    const txt = location.trim();
    const phoneTrimmed = phone.trim();
  
    if (!txt) {
      message.error("Please enter your location.");
      return;
    }
  
    // 📌 Validate Phone Number
    const phoneRegex = /^0\d{9}$/; // Must start with 0 and have 10 digits
    if (!phoneRegex.test(phoneTrimmed)) {
      message.error("Please enter a valid 10-digit phone number starting with 0.");
      return;
    }
  
    // 📌 Validate Location
    const coordRegex = /^Lat: [-+]?[0-9]*\.?[0-9]+, Long: [-+]?[0-9]*\.?[0-9]+$/;
    const addrRegex = /^[a-zA-Z0-9\s,.-]{5,}$/;
    if (coordRegex.test(txt) || addrRegex.test(txt)) {
      proceedToPayment();
    } else {
      message.error("Please enter a valid address (min 5 characters) or click ‘Share My Location’.");
    }
  };
  
  

  const proceedToPayment = () => {
    try {
      // Save cart, total, location, and phone to localStorage
      localStorage.setItem(`location_user_${user._id}`, location);
      localStorage.setItem(`phone_user_${user._id}`, phone);  // ✨ Save phone
      localStorage.setItem(`total_price_user_${user._id}`, getTotalPrice());
      
      

      message.success("✅ Location saved. Proceeding to payment...");
      setModalVisible(false);
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Error saving location:", error);
      message.error("❌ Could not proceed to payment. Try again.");
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      message.error("❌ Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const r = await axios.get("https://nominatim.openstreetmap.org/reverse", {
            params: { lat: latitude, lon: longitude, format: "json" },
          });
          const addr = r.data.display_name;
          if (addr) {
            setLocation(addr);
            message.success("✅ Location detected and filled!");
          } else {
            const fallback = `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`;
            setLocation(fallback);
            message.warning("⚠️ Coordinates used (no address found).");
          }
        } catch {
          const fallback = `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`;
          setLocation(fallback);
          message.error("❌ Couldn't fetch address. Coordinates used.");
        }
      },
      err => {
        console.error("Error getting location:", err);
        message.error("❌ Unable to retrieve your location.");
      }
    );
  };

  return (
    <div className="containerorder">
      <h2>Package Order Summary</h2>

      <Button
        className="backbutton"
        onClick={() => navigate("/view-package")}
        type="default"
        style={{
          position: "fixed",
          top: "30px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
        }}
      >
        ← Back to Packages
      </Button>

      {cart.length > 0 ? (
        <div className="cart">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <h4>{item.name}</h4>
              <p>Rs.{item.finalPrice.toFixed(2)}</p>
              <Input
                type="number"
                min={1}
                max={25}
                value={item.quantity}
                onChange={e => handleQuantityChange(item._id, e.target.value)}
                onFocus={e => e.target.select()}
                onBlur={e => {
                  if (!e.target.value) handleQuantityChange(item._id, "1");
                }}
              />
              <Button id="b3" onClick={() => handleRemoveFromCart(item._id)} type="danger">
                Remove
              </Button>
            </div>
          ))}
          <h3>Total Price : Rs {getTotalPrice()}</h3>
          <div className="terms-checkbox">
            <Checkbox onChange={e => setIsAgreed(e.target.checked)}>
              I agree to the{' '}
              <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
                Terms and Conditions
              </a>.
            </Checkbox>
          </div>
          <Button
            className="pay-button"
            onClick={handlePay}
            type="primary"
            disabled={!isAgreed}
          >
            Pay
          </Button>
        </div>
      ) : (
        <p>No packages in the cart</p>
      )}

      <Button
        className="order-history-button"
        onClick={() => navigate("/OrderHistoryDetails")}
        type="default"
      >
        Order History
      </Button>

      <Modal
        title="Enter Your Location & Phone"
        open={modalVisible}
        onOk={handleConfirmLocation}
        onCancel={() => setModalVisible(false)}
        okText="Proceed to Pay"
      >
        <Input
          placeholder="Enter your location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Button onClick={getUserLocation} type="default" style={{ marginBottom: "10px" }}>
          Share My Location
        </Button>
        <Input
          placeholder="Enter your Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          maxLength={15}
        />
      </Modal>
    </div>
  );
};

export default OrderPage;
