import React from 'react';
import { useNavigate } from "react-router-dom";

const PaymentDetails = () => {
     const navigate = useNavigate();
  return (
    <div>
      <h1>Payment Details </h1>

      {/* Display Payment Details  here */}

<button Click={() => navigate("/order")} >Back </button>
    </div>
  );
  
};

export default PaymentDetails;
