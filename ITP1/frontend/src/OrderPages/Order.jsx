import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input, message, Checkbox } from "antd";
import { useAuth } from "../hooks/useAuth";
import "./Order.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);

  // Load the cart only for the logged-in user
  useEffect(() => {
    if (!user) return;
    const storedCart = JSON.parse(localStorage.getItem(`cart_user_${user._id}`)) || [];
    setCart(storedCart);
  }, [user]);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0).toFixed(2);
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

  const handlePay = async () => {
    if (!user) {
      message.error("❌ User not logged in! Please log in to continue.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      message.error("Your cart is empty!");
      return;
    }

    const orderData = {
      user: user.name,
      items: cart,
      total: parseFloat(getTotalPrice()),
    };

    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      message.success(response.data.message);
      localStorage.removeItem(`cart_user_${user._id}`);
      setCart([]);
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Order Error:", error.response?.data || error.message);
      message.error("❌ Order Failed! Check console for details.");
    }
  };

  return (
    <div className="container">
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
              I agree to the <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a>.
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

      <Button className="order-history-button" onClick={() => navigate("/OrderHistoryDetails")} type="default">
        Order History
      </Button>
    </div>
  );
};

export default OrderPage;
