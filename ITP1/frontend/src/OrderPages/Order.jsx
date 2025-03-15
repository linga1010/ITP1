import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "antd";
import "./Order.css";

const OrderPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0).toFixed(2);
  };

  const handleIncreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleDecreaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item._id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
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
    const orderData = {
      user: "test_user",
      items: cart,
      total: parseFloat(getTotalPrice()),
    };

    console.log("📦 Sending Order Data:", orderData);

    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      alert(response.data.message);
      navigate("/PaymentDetails");
    } catch (error) {
      console.error("❌ Order Error:", error.response?.data || error.message);
      alert("❌ Order Failed! Check the console for details.");
    }
  };

  const handleOrderHistory = () => {
    navigate("/OrderHistoryDetails");
  };

  const handleBack = () => {
    navigate("/view-package");
  };

  return (
    <div className="container">
      <h2>Package Order Summary</h2>
      <Button className="back-button" onClick={handleBack} type="default">
        ← Back to Packages
      </Button>

      {cart.length > 0 ? (
        <div className="cart">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <h4>{item.name}</h4>
              <p>
                ₹{item.finalPrice.toFixed(2)} x {item.quantity}
              </p>
              <Button id="b1" onClick={() => handleIncreaseQuantity(item._id)} type="primary">
                +
              </Button>
              <Button id="b2" onClick={() => handleDecreaseQuantity(item._id)} type="default">
                -
              </Button>
              <Button id="b3" onClick={() => handleRemoveFromCart(item._id)} type="danger">
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
