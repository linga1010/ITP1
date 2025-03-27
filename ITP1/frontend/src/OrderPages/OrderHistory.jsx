import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return; // Wait for authentication to load

    if (!user) {
      navigate("/login"); // Redirect to login if user is not authenticated
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${user.name}`);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again.");
        console.error("❌ Fetch Orders Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  return (
    <div className="order-history-container">
      <h2>🛒 Order History</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <h3>📅 Order Date: {new Date(order.createdAt).toLocaleDateString()}</h3>
          <h3>⏰ Order Time: {new Date(order.createdAt).toLocaleTimeString()}</h3>
          <h4>🛍️ Ordered Items:</h4>
          <ul>
            {order.items.map((item, index) => {
              console.log("Item:", item); // Verify if price and finalPrice are present
              return (
                <li key={index}>
                  {item.name} - Rs.{item.price ? item.price : "N/A"} x {item.quantity} 
                  (Final Price: Rs.{item.finalPrice ? item.finalPrice : "N/A"})
                </li>
              );
            })}
          </ul>
          <h3>Total: Rs.{order.total}</h3>
          <h3>Status: 
            <span className={ 
              order.status === "success" 
                ? "status-success" 
                : order.status === "removed" 
                  ? "status-removed" 
                  : "status-pending"
            }>
              {order.status === "removed" ? "Removed Order" : order.status}
            </span>
          </h3>
        </div>
      ))}

      <button className="back-button" onClick={() => navigate("/order")}>⬅ Back to OrderPage</button>
    </div>
  );
};

export default OrderHistory;
