// ViewOrderBookings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VeiwBooking.css";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const navigate = useNavigate();

  const [orderCounts, setOrderCounts] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    removedOrders: 0,
    canceledOrders: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const profileRes = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.data.isAdmin) return navigate("/user-home");

        const [bookingsRes, productRes, packageRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/packages")
        ]);

        const sorted = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sorted);
        setProducts(productRes.data);
        setPackages(packageRes.data);
        updateOrderCounts(sorted);
        calculateSalesAndProfit(sorted, productRes.data, packageRes.data);
      } catch (err) {
        setError("❌ Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    calculateSalesAndProfit(bookings, products, packages);
  }, [startDate, endDate]);
  

  const monthMap = {
    january: 0, february: 1, march: 2, april: 3,
    may: 4, june: 5, july: 6, august: 7,
    september: 8, october: 9, november: 10, december: 11,
  };

  const updateOrderCounts = (orders) => {
    setOrderCounts({
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      shippingOrders: orders.filter(o => o.status === "shipped").length,
      deliveredOrders: orders.filter(o => o.status === "delivered").length,
      removedOrders: orders.filter(o => o.status === "removed").length,
      canceledOrders: orders.filter(o => o.status === "canceled").length,
    });
  };

  const isInDateRange = (dateStr) => {
    const date = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || date >= start) && (!end || date <= end);
  };

  const calculateSalesAndProfit = (orders, productList, packageList) => {
    let sales = 0;
    let profit = 0;

    orders.forEach(order => {
      if (order.status === "delivered" && isInDateRange(order.createdAt)) {
        sales += order.total;
        order.items.forEach(item => {
          const pack = packageList.find(p => p.name === item.name);
          if (pack) {
            let itemProfit = 0;
            pack.products.forEach(({ productId, quantity }) => {
              const prod = productList.find(p => p._id === productId._id);
              if (prod) {
                const unitsSold = quantity * item.quantity;
                itemProfit += (prod.sellingPrice - prod.costPrice) * unitsSold;
              }
            });
            const discount = (pack.totalPrice - pack.finalPrice) * item.quantity;
            profit += itemProfit - discount;
          }
        });
      }
    });

    setTotalSales(sales);
    setTotalProfit(profit);
  };

  const calculateOrderProfit = (order) => {
    if (order.status !== "delivered" || !isInDateRange(order.createdAt)) return "0.00";

    let totalProfit = 0;
    order.items.forEach(item => {
      const pack = packages.find(p => p.name === item.name);
      if (pack) {
        let itemProfit = 0;
        pack.products.forEach(({ productId, quantity }) => {
          const prod = products.find(p => p._id === productId._id);
          if (prod) {
            const unitsSold = quantity * item.quantity;
            itemProfit += (prod.sellingPrice - prod.costPrice) * unitsSold;
          }
        });
        const discount = (pack.totalPrice - pack.finalPrice) * item.quantity;
        totalProfit += itemProfit - discount;
      }
    });
    return totalProfit.toFixed(2);
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("❌ Unauthorized! Please log in again.");

    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedBookings = bookings.map((order) =>
        order._id === orderId ? { ...order, status: response.data.order.status } : order
      );

      setBookings(updatedBookings);
      updateOrderCounts(updatedBookings);
      calculateSalesAndProfit(updatedBookings, products, packages);

      alert(`✅ Order marked as ${status} successfully!`);
    } catch (err) {
      console.error(`❌ Failed to update order to ${status}:`, err);
      console.log("💬 Backend response:", err.response?.data);
      alert(err.response?.data?.message || "❌ Failed to update order.");
    }
  };

  const handleStartDateChange = e => {
    const sel = new Date(e.target.value);
    if (endDate) {
      const end = new Date(endDate);
      const min = new Date(end);
      min.setMonth(end.getMonth() - 1);
      if (sel > end || sel < min) {
        return alert("⚠️ Start date must be before end date .");
      }
    }
    setStartDate(e.target.value);
  };

  const handleEndDateChange = e => {
    const sel = new Date(e.target.value);
    if (startDate) {
      const st = new Date(startDate);
      const max = new Date(st);
      max.setMonth(st.getMonth() + 1);
      if (sel < st || sel > max) {
        return alert("⚠️ End date must be after start date .");
      }
    }
    setEndDate(e.target.value);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };
  
  

  const filteredBookings = bookings.filter(order => {
    const dt = new Date(order.createdAt);

    // if startDate set, exclude earlier
    let start = startDate ? new Date(startDate) : null;
    if (start && dt < start) return false;

    // if endDate set, extend to 23:59:59
    let end = endDate ? new Date(endDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
      if (dt > end) return false;
    }

    const s = searchTerm.toLowerCase();
    const monthName = dt.toLocaleString("default", { month: "long" }).toLowerCase();
    const monthIdx = dt.getMonth() + 1;

    return (
      (order.user && order.user.toLowerCase().includes(s)) ||
      (order.userName && order.userName.toLowerCase().includes(s)) ||
      (order.status && order.status.toLowerCase().includes(s)) ||
      dt.toLocaleDateString().includes(s) ||
      monthName.includes(s) ||
      (!isNaN(s) && parseInt(s) === monthIdx) ||
      (monthMap[s] === dt.getMonth())
    );
  });

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <div className="view-bookings-container">
          <h2 className="booking-title">📋 All Order Booking Details</h2>

          <h4 className="summary-heading">📦 Order Summary</h4>
        <div className="status-box-row">
          <div className="status-box">Total: {orderCounts.totalOrders}</div>
          <div className="status-box">Pending: {orderCounts.pendingOrders}</div>
          <div className="status-box">Shipping: {orderCounts.shippingOrders}</div>
          <div className="status-box">Delivered: {orderCounts.deliveredOrders}</div>
          <div className="status-box">Removed: {orderCounts.removedOrders}</div>
          <div className="status-box">Canceled: {orderCounts.canceledOrders}</div>
        </div>

          <h4 className="summary-heading">💰 Sales & Profit</h4>
          <div className="card summary-card gradient-green">
            <p>Total Sales: Rs {totalSales}</p>
            <p>Total Profit: Rs {totalProfit.toFixed(2)}</p>
          </div>

          <div className="filters-row">
            <input
              type="text"
              placeholder="Search by User, Name, Status, or Date 🔍︎"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
            <div className="date-input">
              <label>Start Date:</label>
              <input type="date" value={startDate} onChange={handleStartDateChange} max={today} />
            </div>
            <div className="date-input">
              <label>End Date:</label>
              <input type="date" value={endDate} onChange={handleEndDateChange} max={today}/>
            </div>       
            <button className="clear-date-btn" onClick={clearFilters}>
            ❌Clear
            </button>
          </div>

          <div className="booking-table">
            {filteredBookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>UserName</th>
                    <th>Items</th>
                    <th>Total + Profit</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((order) => (
                    <tr key={order._id}>
                      <td>{order.user}</td>
                      <td>{order.userName}</td>
                      <td>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.name} (x{item.quantity}) – Rs. {item.finalPrice || item.price}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        Rs. {order.total}
                        <br />
                        <span style={{ color: "green", fontSize: "0.9em" }}>
                          Profit: Rs {calculateOrderProfit(order)}
                        </span>
                      </td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                       {order.status === "pending" ? (
                        <>
                         <button
                          className="confirm-btn"
                           onClick={() => {
                          if (window.confirm("Are you sure you want to confirm this order?")) {
                          updateOrderStatus(order._id, "confirm");
                         }
                        }}
                         >
                       ✅ Confirm Order
                       </button>
                      <button
                       className="remove-btn"
                        onClick={() => {
                         if (window.confirm("Are you sure you want to remove this order?")) {
                          updateOrderStatus(order._id, "remove");
                         }
                        }}
                       >
                        ❌ Remove Order
                      </button>
                    </>
                    ) : order.status === "success" ? (
  <button
    className="ship-btn"
    onClick={() => {
      if (window.confirm("Are you sure you want to ship this order?")) {
        updateOrderStatus(order._id, "ship");
      }
    }}
  >
    🚚 Ship Order
  </button>
                    ) : order.status === "shipped" ? (
                     <button
                       className="deliver-btn"
                       onClick={() => {
                     if (window.confirm("Are you sure you want to deliver this order?")) {
                      updateOrderStatus(order._id, "deliver");
                       }
                      }}
                     >
                    📦 Deliver Order
                    </button>
                    ) : order.status === "delivered" ? (
                    <span className="delivered-tag">✅ Delivered</span>
                    ) : order.status === "removed" ? (
                      <span className="removed-tag">❌ Removed</span>
                    ) : order.status === "canceled" ? (
                      <span className="canceled-tag">❌ Canceled</span>
                    ) : (
                    <span>✔ Confirmed</span>
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
