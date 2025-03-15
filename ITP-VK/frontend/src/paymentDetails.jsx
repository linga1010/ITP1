import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentDetail = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    ifscCode: "",
  });

  const [savedDetails, setSavedDetails] = useState(null);

  // Fetch existing bank details from the backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/payment-details")
      .then((response) => {
        if (response.data) {
          setSavedDetails(response.data);
        }
      })
      .catch((error) => console.error("Error fetching bank details:", error));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  // Submit bank details to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/payment-details", bankDetails);
      alert("Payment details saved successfully!");
      setSavedDetails(response.data);
    } catch (error) {
      console.error("Error saving payment details:", error);
    }
  };

  return (
    <div>
      <h2>Payment Details</h2>

      {savedDetails ? (
        <div>
          <h3>Saved Bank Details</h3>
          <p><strong>Bank Name:</strong> {savedDetails.bankName}</p>
          <p><strong>Account Number:</strong> {savedDetails.accountNumber}</p>
          <p><strong>Account Holder:</strong> {savedDetails.accountHolder}</p>
          <p><strong>IFSC Code:</strong> {savedDetails.ifscCode}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Bank Name:</label>
          <input type="text" name="bankName" value={bankDetails.bankName} onChange={handleChange} required />

          <label>Account Number:</label>
          <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleChange} required />

          <label>Account Holder:</label>
          <input type="text" name="accountHolder" value={bankDetails.accountHolder} onChange={handleChange} required />

          <label>IFSC Code:</label>
          <input type="text" name="ifscCode" value={bankDetails.ifscCode} onChange={handleChange} required />

          <button type="submit">Save Details</button>
        </form>
      )}
    </div>
  );
};

export default PaymentDetail;
