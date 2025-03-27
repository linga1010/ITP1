import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css'; // Import the CSS file
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Import the Admin Navigation Component

const InvoiceList = ({ onSalesUpdate }) => { // Add onSalesUpdate as a prop
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    // Whenever filteredInvoices change, calculate total sales and pass it to AdminDashboard
    const totalSales = calculateTotalSales();
    if (typeof onSalesUpdate === 'function') {
      onSalesUpdate(totalSales);
    } else {
      console.warn('onSalesUpdate is not a function');
    }
  }, [filteredInvoices, onSalesUpdate]); // Ensure the function is passed in dependencies

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      setInvoices(Array.isArray(response.data.invoices) ? response.data.invoices : []);
      setFilteredInvoices(Array.isArray(response.data.invoices) ? response.data.invoices : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${invoiceNumber}`);
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber));
        setFilteredInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.invoiceNumber !== invoiceNumber));
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = invoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
    setFilteredInvoices(filtered);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      const filteredByDate = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= new Date(startDate) && invoiceDate <= new Date(endDate);
      });
      setFilteredInvoices(filteredByDate);
    }
  };

  const calculateTotalSales = () => {
    return filteredInvoices.reduce((total, invoice) => total + (invoice.amountAfterDiscount || 0), 0);
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion /> {/* Add the Admin navigation component here */}

      <div className="main-content">
        <h2>Invoice List</h2>

        <div className="create-invoice-container">
          <button onClick={() => navigate('/invoices/create')}>Create Invoice</button>
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Invoice Number"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-container">
          <div className="date-container">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button onClick={handleDateFilter}>Filter by Date</button>
          </div>
        </div>

        {/* Invoice Table */}
        <div>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Customer Name</th>
                <th>Amount After</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString();
                  return (
                    <tr key={invoice._id || invoice.invoiceNumber}>
                      <td>{invoice.invoiceNumber || invoice._id}</td>
                      <td>{formattedDate}</td>
                      <td>{invoice.customerName}</td>
                      <td>₹{invoice.amountAfterDiscount?.toFixed(2)}</td>
                      <td>
                        <ul>
                          {invoice.items && invoice.items.length > 0 ? (
                            invoice.items.map((item, index) => (
                              <li key={index}>
                                {item.productName} - {item.amount} x {item.quantity} {item.unit}
                              </li>
                            ))
                          ) : (
                            <li>No products found</li>
                          )}
                        </ul>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(invoice.invoiceNumber)} className="Delete">
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">No invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;

//C:\Destop\Linga\ITP1\ITP1\frontend\src\invontorypage\InvoiceList.js
