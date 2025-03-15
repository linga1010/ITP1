import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css'; // Import the CSS file

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate(); // For handling navigation

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      console.log('Fetched invoices:', response.data); // Debugging API response
      // Ensure invoices are an array and handle the possibility of missing product data
      setInvoices(Array.isArray(response.data.invoices) ? response.data.invoices : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]); // Fallback to empty array to avoid errors
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${invoiceNumber}`);
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber));
      } catch (error) {
        console.error('Error deleting invoice:', error.response?.data || error.message);
      }
    }
  };

 

  return (
    <div>
      <h2>Invoice List</h2>
      <button onClick={() => navigate('/invoices/create')}>Create Invoice</button>
      <br />
      <br />
      
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Total Amount</th>
            <th>Discount (%)</th>
            <th>Amount After Discount</th>
            <th>Products</th> {/* Add Products column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice._id || invoice.invoiceNumber}>
                <td>{invoice.invoiceNumber || invoice._id}</td>
                <td>{invoice.customerName}</td>
                <td>₹{invoice.totalAmount?.toFixed(2)}</td>
                <td>{invoice.discount}%</td>
                <td>₹{invoice.amountAfterDiscount?.toFixed(2)}</td>
                {/* Render Product Details */}
                <td>
                  <ul>
                    {invoice.items && invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => (
                        <li key={index}>
                          {item.productName} - {item.amount} x {item.quantity} {item.unit} {/* Display unit */}
                        </li>
                      ))
                    ) : (
                      <li>No products found</li>
                    )}
                  </ul>
                </td>
                <td>
                  <button onClick={() => handleDelete(invoice.invoiceNumber)} className="danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">No invoices found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;


