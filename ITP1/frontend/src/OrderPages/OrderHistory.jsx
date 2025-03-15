import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = "test_user"; // Replace this with actual user authentication logic

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${user}`);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again.");
        console.error("❌ Fetch Orders Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="order-history-container">
      <h2>🛒 Order History</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      
      {!loading && orders.length === 0 && <p>No orders found.</p>}

      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <h3>📅 Order Date: {new Date(order.createdAt).toLocaleDateString()}</h3>
          <h4>🛍️ Ordered Items:</h4>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} - ₹{item.price} x {item.quantity}
              </li>
            ))}
          </ul>
          <h3>Total: ₹{order.total}</h3>
        </div>
      ))}

      <button className="back-button" onClick={() => navigate("/order")}>
        ⬅ Back to Shop
      </button>
    </div>
  );
};

export default OrderHistory;
