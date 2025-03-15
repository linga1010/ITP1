//Order.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "antd";
import "./Order.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []); // Get cart from localStorage or initialize as empty array

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0);
  };

  const handleIncreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
  };

  const handleDecreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
  };

  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter((item) => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
  };

  const handlePay = async () => {
    const orderData = {
      user: "test_user", // You can replace with actual user data if available
      items: cart,
      total: getTotalPrice(),
    };

    console.log("📦 Sending Order Data:", orderData);

    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      alert(response.data.message);
      navigate("/Payment"); // Redirect to Payment page
    } catch (error) {
      console.error("❌ Order Error:", error.response?.data || error.message);
      alert("❌ Order Failed! Check the console for details.");
    }
  };

  const handleOrderHistory = () => {
    navigate("/order-history");
  };

  return (
    <div className="container">
      <h2>Package Order Summary</h2>
      {cart.length > 0 ? (
        <div className="cart">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <h4>{item.name}</h4>
              <p>
                ₹{item.finalPrice} x {item.quantity}
              </p>
              <Button onClick={() => handleIncreaseQuantity(item._id)} type="primary">
                +
              </Button>
              <Button onClick={() => handleDecreaseQuantity(item._id)} type="default">
                -
              </Button>
              <Button
                onClick={() => handleRemoveFromCart(item._id)}
                type="danger"
              >
                Remove
              </Button>
            </div>
          ))}
          <h3>Total: ₹{getTotalPrice()}</h3>

          <Button className="pay-button" onClick={handlePay} type="primary">
            Pay
          </Button>
          <Button className="order-history-button" onClick={handleOrderHistory} type="default">
            Order History
          </Button>
        </div>
      ) : (
        <p>No packages in the cart</p>
      )}
    </div>
  );
};

export default OrderPage;
