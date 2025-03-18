import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VeiwBooking.css';
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Check if user is admin first
        const profileRes = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.data.isAdmin) {
          setError('Access denied. Admins only.');
          navigate('/user-home'); // Redirect non-admins
          return;
        }

        // Fetch bookings only if admin
        const bookingsRes = await axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Failed to fetch bookings or profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const confirmOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/confirm`);
      setBookings((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: "success" } : order))
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Error updating order status. Please try again.");
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
    <Adminnaviagtion /> {/* Add the Admin navigation component here */}

    <div className="main-content">
    <div className="view-bookings-container">
      <h2>All Booking Details</h2>
      <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>
        ⬅ Back to Admin Dashboard
      </button>

      <div className="booking-table">
        {bookings.length === 0 ? (
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
              {bookings.map((order) => (
                <tr key={order._id}>
                  <td>{order.user}</td>
                  <td>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} (x{item.quantity}) - ₹{item.price}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={order.status === "success" ? "status-success" : "status-pending"}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    {order.status === "pending" && (
                      <button className="confirm-btn" onClick={() => confirmOrder(order._id)}>
                        ✅ Confirm
                      </button>
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
