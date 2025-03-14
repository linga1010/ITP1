import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Order.css";

const OrderPage = ({ cart, increaseQuantity, decreaseQuantity, removeFromCart }) => {
  const navigate = useNavigate(); // Hook for navigation

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Function to navigate to payment page
  const handlePay = () => {
    navigate("/payment"); // Navigate to the Payment page
  };

  // Function to navigate to order history page
  const handleOrderHistory = () => {
    navigate("/order-history"); // Navigate to the Order History page
  };

  return (
    <div className="container">
      <h2>Order Summary</h2>
      {cart.length > 0 ? (
        <div className="cart">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <h4>{item.name}</h4>
              <p>₹{item.price} x {item.quantity}</p>
              <button onClick={() => increaseQuantity(item.id)}>+</button>
              <button onClick={() => decreaseQuantity(item.id)}>-</button>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ₹{getTotalPrice()}</h3>

          {/* Pay Button */}
          <button className="pay-button" onClick={handlePay}>Pay</button>

          {/* Order History Button */}
          <button className="order-history-button" onClick={handleOrderHistory}>Order History</button>
        </div>
      ) : (
        <p>No items in the cart</p>
      )}
    </div>
  );
};

export default OrderPage;
