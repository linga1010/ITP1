import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spin, message } from "antd";
import "../styles/Body.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const ViewPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payment data when the component mounts
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Fetch payments with populated user details
        const response = await axios.get("http://localhost:5000/api/viewPaymentDetails");
        setPayments(response.data); 
        setLoading(false);
      } catch (err) {
        setError("Failed to load payment data.");
        setLoading(false);
        message.error("Failed to load payment data.");
      }
    };

    fetchPayments();
  }, []);

  // Table columns for displaying payment data
  const columns = [
    {
      title: "User Name",
      dataIndex: "userId",
      key: "userId",
      render: (user) => user?.name || "Unknown User", // Display user name safely
    },
    {
      title: "Card Number",
      dataIndex: "cardNumber",
      key: "cardNumber",
      render: (cardNumber) => `**** **** **** ${cardNumber.slice(-4)}`, // Mask card number
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Total Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice) => `Rs.${totalPrice.toFixed(2)}`,
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
    },
    {
      title: "Payment Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="admin-payments-container">
        <h2>Payment Details</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={payments}
            columns={columns}
            rowKey="_id"
            bordered
            pagination={false} // Disable pagination
          />
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default ViewPayments;
