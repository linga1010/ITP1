import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PaymentDetails = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) {
    navigate("/login"); // Redirect to login if user is not authenticated
    return null;
  }

  return (
    <div>
      <h1>Payment Details</h1>

      {/* Display Payment Details here */}

      <button onClick={() => navigate("/order")} >Back</button>
    </div>
  );
};

export default PaymentDetails;
