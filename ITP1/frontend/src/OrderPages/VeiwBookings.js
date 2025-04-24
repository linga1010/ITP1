// ViewBookings.jsx
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

        const [bookingsRes, productRes, packageRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/products"),
          axios.get("http://localhost:5000/api/packages")
        ]);

        const sortedBookings = bookingsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBookings(sortedBookings);
        setProducts(productRes.data);
        setPackages(packageRes.data);
        updateOrderCounts(sortedBookings);
        calculateSalesAndProfit(sortedBookings, productRes.data, packageRes.data);
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
    setOrderCounts({
      totalOrders: bookings.length,
      pendingOrders: bookings.filter(order => order.status === "pending").length,
      shippingOrders: bookings.filter(order => order.status === "shipped").length,
      deliveredOrders: bookings.filter(order => order.status === "delivered").length,
      removedOrders: bookings.filter(order => order.status === "removed").length,
      canceledOrders: bookings.filter(order => order.status === "canceled").length,
    });
  };

  const handleStartDateChange = (e) => {
    const selectedStart = new Date(e.target.value);
    if (endDate) {
      const selectedEnd = new Date(endDate);
      const oneMonthEarlier = new Date(selectedEnd);
      oneMonthEarlier.setMonth(oneMonthEarlier.getMonth() - 1);
  
      if (selectedStart > selectedEnd || selectedStart < oneMonthEarlier) {
        alert("⚠️ Start date must be before end date and within one month.");
        return;
      }
    }
    setStartDate(e.target.value);
  };
  
  
  const handleEndDateChange = (e) => {
    const selectedEnd = new Date(e.target.value);
    if (startDate) {
      const selectedStart = new Date(startDate);
      const oneMonthLater = new Date(selectedStart);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  
      if (selectedEnd < selectedStart || selectedEnd > oneMonthLater) {
        alert("⚠️ End date must be after start date and within one month.");
        return;
      }
    }
    setEndDate(e.target.value);
  };
  

  const calculateSalesAndProfit = async (orders, productList, packageList) => {
    let sales = 0;
    let profit = 0;

    for (const order of orders) {
      if (order.status === "delivered") {
        sales += order.total;

        for (const item of order.items) {
          const pack = packageList.find(p => p.name === item.name);
          if (pack) {
            let itemProfit = 0;

            for (const { productId, quantity } of pack.products) {
              const product = productList.find(p => p._id === productId._id);
              if (product) {
                const unitsSold = quantity * item.quantity;
                const productProfit = (product.sellingPrice - product.costPrice) * unitsSold;
                itemProfit += productProfit;
              }
            }

            const discount = (pack.totalPrice - pack.finalPrice) * item.quantity;
            itemProfit -= discount;
            profit += itemProfit;
          }
        }
      }
    }

    setTotalSales(sales);
    setTotalProfit(profit);
  };

  const calculateOrderProfit = (order) => {
    let totalProfit = 0;

    for (const item of order.items) {
      const pack = packages.find(p => p.name === item.name);
      console.log(pack);
      if (pack) {
        let itemProfit = 0;

        for (const { productId, quantity } of pack.products) {
          const product = products.find((p) => p._id === productId._id); // 👈 FIXED here!
        
          if (product) {
            const unitsSold = quantity * item.quantity;
            const profit = (product.sellingPrice - product.costPrice) * unitsSold;
            itemProfit += profit;
          } else {
            console.warn("⚠️ Product not found for ID:", productId._id);
          }
        }
        
        

        const discount = (pack.totalPrice - pack.finalPrice) * item.quantity;
        itemProfit -= discount;
        totalProfit += itemProfit;
      }
    }
    

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
      alert("❌ Failed to update order.");
    }
  };

  const monthMap = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  
  const filteredBookings = bookings.filter(order => {
    const createdAt = new Date(order.createdAt);
    const monthIndex = createdAt.getMonth(); // 0 (Jan) to 11 (Dec)
    const monthName = createdAt.toLocaleString("default", { month: "long" }); // "April"
    const search = searchTerm.toLowerCase();
  
    const matchesMonthName = monthName.toLowerCase().includes(search);
    const matchesMonthNumber = !isNaN(search) && parseInt(search) === monthIndex + 1;
    const matchesMappedMonth = monthMap[search] !== undefined && monthMap[search] === monthIndex;
  
    return (
      (order.user && order.user.toLowerCase().includes(search)) ||
      (order.userName && order.userName.toLowerCase().includes(search)) ||
      (order.status && order.status.toLowerCase().includes(search)) ||
      createdAt.toLocaleDateString().includes(search) ||
      matchesMonthName || matchesMonthNumber || matchesMappedMonth
    );
  });

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <div className="view-bookings-container">
          <h2>All Order Booking Details</h2>

          


          <div className="order-summary">
            <h3>Order Summary</h3>
            <p>Total Orders: {orderCounts.totalOrders}</p>
            <p>Pending Orders: {orderCounts.pendingOrders}</p>
            <p>Shipping Orders: {orderCounts.shippingOrders}</p>
            <p>Delivered Orders: {orderCounts.deliveredOrders}</p>
            <p>Removed Orders: {orderCounts.removedOrders}</p>
            <p>Canceled Orders: {orderCounts.canceledOrders}</p>
          </div>

          <div className="sales-profit">
            <h3>💰 Sales & Profit</h3>
            <p>Total Sales (Delivered): Rs. {totalSales}</p>
            <p>Total Profit (Delivered): Rs. {totalProfit.toFixed(2)}</p>
          </div>

          <input
            type="text"
            placeholder="Search by User, Name, Status, or Date     🔍︎"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          <div className="date-filter">
            <label>
              Start Date:{" "}
                <input type="date" value={startDate} onChange={handleStartDateChange} />
            </label>
            <label style={{ marginLeft: "1rem" }}>
              End Date:{" "}
                <input type="date" value={endDate} onChange={handleEndDateChange} />
             </label>
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
                              {item.name} (x{item.quantity}) - Rs. {item.finalPrice || item.price}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        Rs. {order.total}
                        <br />
                        <span style={{ color: "green", fontSize: "0.9em" }}>
                          Profit: Rs. {calculateOrderProfit(order)}
                        </span>
                      </td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        {order.status === "pending" ? (
                          <>
                            <button className="confirm-btn" onClick={() => updateOrderStatus(order._id, "confirm")}>
                              ✅ Confirm Order
                            </button>
                            <br />
                            <button className="remove-btn" onClick={() => updateOrderStatus(order._id, "remove")}>
                              ❌ Remove Order
                            </button>
                          </>
                        ) : order.status === "success" ? (
                          <button className="ship-btn" onClick={() => updateOrderStatus(order._id, "ship")}>
                            🚚 Ship Order
                          </button>
                        ) : order.status === "shipped" ? (
                          <button className="deliver-btn" onClick={() => updateOrderStatus(order._id, "deliver")}>
                            📦 Deliver Order
                          </button>
                        ) : order.status === "delivered" ? (
                          <p>✅ Delivered</p>
                        ) : order.status === "removed" ? (
                          <p>❌ Removed</p>
                        ) : order.status === "canceled" ? (
                          <p>❌ Canceled</p>
                        ) : (
                          <p>✔ Confirmed</p>
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