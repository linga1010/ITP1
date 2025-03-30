import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VeiwBooking.css";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [orderCounts, setOrderCounts] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    removedOrders: 0,
    canceledOrders: 0,
  });

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.data.isAdmin) {
          setError("❌ Access denied. Admins only.");
          navigate("/user-home");
          return;
        }

        const bookingsRes = await axios.get("http://localhost:5000/api/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedBookings = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setBookings(sortedBookings);
        updateOrderCounts(sortedBookings);
      } catch (err) {
        console.error("❌ Failed to fetch bookings:", err);
        setError("❌ Failed to fetch bookings or profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const updateOrderCounts = (bookings) => {
    const totalOrders = bookings.length;
    const pendingOrders = bookings.filter(order => order.status === "pending").length;
    const shippingOrders = bookings.filter(order => order.status === "shipped").length;
    const deliveredOrders = bookings.filter(order => order.status === "delivered").length;
    const removedOrders = bookings.filter(order => order.status === "removed").length;
    const canceledOrders = bookings.filter(order => order.status === "canceled").length;

    setOrderCounts({
      totalOrders,
      pendingOrders,
      shippingOrders,
      deliveredOrders,
      removedOrders,
      canceledOrders,
    });
  };

  const filteredBookings = bookings.filter(order =>
    order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(order.createdAt).toLocaleDateString().includes(searchTerm)
  );

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("❌ Unauthorized! Please log in again.");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the order status in the local state
      const updatedBookings = bookings.map((order) =>
        order._id === orderId ? { ...order, status: response.data.order.status } : order
      );

      setBookings(updatedBookings);
      updateOrderCounts(updatedBookings); // Recalculate counts

      alert(`✅ Order marked as ${status}!`);
    } catch (err) {
      console.error(`❌ Failed to update order to ${status}:`, err);
      alert(`❌ Error updating order to ${status}. Please try again.`);
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />

      <div className="main-content">
        <div className="view-bookings-container">
          <h2>All Order Booking Details</h2>

          <input
            type="text"
            placeholder="Search by User, Status, or Date     🔍︎"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          <div className="order-summary">
            <h3>Order Summary</h3>
            <p>Total Orders: {orderCounts.totalOrders}</p>
            <p>Pending Orders: {orderCounts.pendingOrders}</p>
            <p>Shipping Orders: {orderCounts.shippingOrders}</p>
            <p>Delivered Orders: {orderCounts.deliveredOrders}</p>
            <p>Removed Orders: {orderCounts.removedOrders}</p>
            <p>Canceled Orders: {orderCounts.canceledOrders}</p>
          </div>

          <div className="booking-table">
            {filteredBookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((order) => (
                    <tr key={order._id}>
                      <td>{order.user}</td>
                      <td>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>{item.name} (x{item.quantity}) - Rs.{item.finalPrice || item.price}</li>
                          ))}
                        </ul>
                      </td>
                      <td>RS.{order.total}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        {order.status === "pending" ? (
                          <>
                            <button
                              className="confirm-btn"
                              onClick={() => updateOrderStatus(order._id, "confirm")}
                            >
                              ✅ Confirm Order
                            </button>
                            <br />
                            <button
                              className="remove-btn"
                              onClick={() => updateOrderStatus(order._id, "remove")}
                            >
                              ❌ Remove Order
                            </button>
                          </>
                        ) : order.status === "success" ? (
                          <button
                            className="ship-btn"
                            onClick={() => updateOrderStatus(order._id, "ship")}
                          >
                            🚚 Ship Order
                          </button>
                        ) : order.status === "shipped" ? (
                          <button
                            className="deliver-btn"
                            onClick={() => updateOrderStatus(order._id, "deliver")}
                          >
                            📦 Deliver Order
                          </button>
                        ) : order.status === "delivered" ? (
                          <p>✅ Order Delivered</p>
                        ) : order.status === "removed" ? (
                          <p>❌ Removed Order</p>
                        ) : order.status === "canceled" ? (
                          <p>❌ Canceled Order</p> // Display text instead of button
                        ) : (
                          <p>✔ Order Confirmed</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookings;
