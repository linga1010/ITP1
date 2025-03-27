import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Input, message, Checkbox } from "antd"; // Import Checkbox
import { useAuth } from "../hooks/useAuth";
import "./Order.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false); // Add state to track checkbox

  useEffect(() => {
    const selectedPackage = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(selectedPackage);
  }, []);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0).toFixed(2);
  };

  const handleQuantityChange = (id, value) => {
    // Parse the value to an integer
    let quantity = parseInt(value, 10);

    // Check if the value is a valid number and within the range 1 to 25
    if (isNaN(quantity) || quantity < 1) {
      message.error("Quantity cannot be less than 1");
      quantity = 1; // Reset to 1 if invalid
    } else if (quantity > 25) {
      message.error("Quantity cannot be more than 25");
      quantity = 25; // Reset to 25 if greater than 25
    }

    // Update the cart with the new quantity
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handlePay = async () => {
    if (!user) {
      alert("❌ User not logged in! Please log in to continue.");
      navigate("/login");
      return;
    }

    // Check if any item has an invalid quantity before proceeding with the order
    const invalidItem = cart.find((item) => item.quantity < 1 || item.quantity > 25);
    if (invalidItem) {
      message.error(`Quantity of "${invalidItem.name}" is out of range (1-25). Please correct it.`);
      return; // Stop order submission if any quantity is invalid
    }

    const orderData = {
      user: user.name,
      items: cart,
      total: parseFloat(getTotalPrice()),
    };

    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      alert(response.data.message);
      localStorage.removeItem("cart");
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Order Error:", error.response?.data || error.message);
      alert("❌ Order Failed! Check the console for details.");
    }
  };

  const handleOrderHistory = () => {
    navigate("/OrderHistoryDetails");
  };

  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked); // Set checkbox state
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
                max={25} // Updated max value to 25
                value={item.quantity} // Show the current quantity
                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                onFocus={(e) => e.target.select()} // Select the input when focused
                onBlur={(e) => {
                  // If no input, reset to 1 when user blurs the input
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

          {/* Checkbox for agreeing to Terms and Conditions */}
          <div className="terms-checkbox">
            <Checkbox onChange={handleCheckboxChange}>
              I agree to the <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a>.
            </Checkbox>
          </div>

          {/* Disable the Pay button until terms are agreed */}
          <Button 
            className="pay-button" 
            onClick={handlePay} 
            type="primary" 
            disabled={!isAgreed} // Disable button if checkbox is not checked
          >
            Pay
          </Button>
        </div>
      ) : (
        <p>No packages in the cart</p>
      )}

      <Button className="order-history-button" onClick={handleOrderHistory} type="default">
        Order History
      </Button>
    </div>
  );
};

export default OrderPage;
