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

  useEffect(() => {
    if (!user) return;
    const storedCart = JSON.parse(localStorage.getItem(`cart_user_${user._id}`)) || [];
    setCart(storedCart);
  }, [user]);
  console.log(user)

  const getTotalPrice = () => {
    return cart
      .reduce((total, item) => total + item.finalPrice * item.quantity, 0)
      .toFixed(2);
  };

  const handleQuantityChange = (id, value) => {
    let quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity < 1) {
      message.error("Quantity cannot be less than 1");
      quantity = 1;
    } else if (quantity > 25) {
      message.error("Quantity cannot be more than 25");
      quantity = 25;
    }

    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem(`cart_user_${user._id}`, JSON.stringify(updatedCart));
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

  const handleConfirmLocation = async () => {
    if (!location.trim()) {
      message.error("Please enter your location");
      return;
    }
    if (!/^[a-zA-Z\s]{5,}$/.test(location.trim())) {
      message.error("Location must be at least 5 characters long and contain only letters.");
      return;
    }
  
    const orderData = {
      user: user.email,
      userName: user.name,
      location: location,
      items: cart,
      total: parseFloat(getTotalPrice()),
    };
  
    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      message.success(response.data.message);
  
      localStorage.setItem(`total_price_user_${user._id}`, getTotalPrice());
  
      setModalVisible(false);
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Order Error:", error.response?.data || error.message);
      message.error("❌ Order Failed! Check console for details.");
    }
  };
  
    
 

  return (
    <div className="containerorder">
      <h2>Package Order Summary</h2>
      <Button className="back-button" onClick={() => navigate("/view-package")} type="default">
        ← Back to Packages
      </Button>

      {cart.length > 0 ? (
        <div className="cart">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <h4>{item.name}</h4>
              <p>Rs.{item.finalPrice.toFixed(2)}</p>
              <Input
                type="number"
                min={1}
                max={25}
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    handleQuantityChange(item._id, "1");
                  }
                }}
              />
              <Button id="b3" onClick={() => handleRemoveFromCart(item._id)} type="danger">
                Remove
              </Button>
            </div>
          ))}

          <h3>Total: Rs.{getTotalPrice()}</h3>

          <div className="terms-checkbox">
            <Checkbox onChange={(e) => setIsAgreed(e.target.checked)}>
              I agree to the{" "}
              <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
                Terms and Conditions
              </a>.
            </Checkbox>
          </div>

          <Button className="pay-button" onClick={handlePay} type="primary" disabled={!isAgreed}>
            Pay
          </Button>
        </div>
      ) : (
        <p>No packages in the cart</p>
      )}

      <Button className="order-history-button" onClick={() => navigate("/OrderHistoryDetails")} type="default">
        Order History
      </Button>

      
      <Modal title="Enter Your Location" open={modalVisible} onOk={handleConfirmLocation} onCancel={() => setModalVisible(false)} okText="Pay">
        <Input placeholder="Enter your location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </Modal>
    </div>
  );
};

export default OrderPage;
