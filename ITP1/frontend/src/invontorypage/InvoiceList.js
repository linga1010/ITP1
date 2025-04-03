import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css';
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation';

const InvoiceList = ({ onSalesUpdate }) => {
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchInvoices();
  }, []);

  // Build product lookup (if needed for other purposes)
  const productLookup = useMemo(() => {
    return products.reduce((lookup, product) => {
      lookup[product._id.toString()] = product;
      return lookup;
    }, {});
  }, [products]);

  useEffect(() => {
    const totalSales = calculateTotalSales();
    if (typeof onSalesUpdate === 'function') {
      onSalesUpdate(totalSales);
    }
  }, [filteredInvoices, onSalesUpdate]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      const fetchedInvoices = Array.isArray(response.data.invoices) ? response.data.invoices : [];
      setInvoices(fetchedInvoices);
      setFilteredInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (invoiceNumber) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`http://localhost:5000/api/invoices/${invoiceNumber}`);
        setInvoices((prev) =>
          prev.filter((invoice) => invoice.invoiceNumber !== invoiceNumber)
        );
        setFilteredInvoices((prev) =>
          prev.filter((invoice) => invoice.invoiceNumber !== invoiceNumber)
        );
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
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      // Extracting only month and date for comparison
      const startMonth = start.getMonth();
      const startDay = start.getDate();
      const endMonth = end.getMonth();
      const endDay = end.getDate();
  
      if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
        alert("End date cannot be before the start date in the same month.");
        return;
      }
  
      const filteredByDate = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
  
      setFilteredInvoices(filteredByDate);
    }
  };
  


  const calculateTotalSales = () => {
    return filteredInvoices.reduce(
      (total, invoice) => total + (invoice.amountAfterDiscount || 0),
      0
    );
  };

  const calculateTotalDiscount = () => {
    return filteredInvoices.reduce((totalDiscount, invoice) => {
      const invoiceTotal = invoice.items.reduce(
        (sum, item) => sum + (item.rate * (item.quantity || 0)),
        0
      );
      const discountForInvoice = invoiceTotal - (invoice.amountAfterDiscount || 0);
      return totalDiscount + discountForInvoice;
    }, 0);
  };

  const calculateTotalProfit = () => {
    return filteredInvoices.reduce((totalProfit, invoice) => {
      const totalCost = invoice.items.reduce((sum, item) => {
        // Use the costPrice stored in the invoice item
        const costPrice = item.costPrice || 0;
        return sum + costPrice * item.quantity;
      }, 0);
      const invoiceProfit = (invoice.amountAfterDiscount || 0) - totalCost;
      return totalProfit + invoiceProfit;
    }, 0);
  };

  const totalSales = calculateTotalSales();
  const totalDiscount = calculateTotalDiscount();
  const totalProfit = calculateTotalProfit();

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
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

        <div className="filter-container">
          <div className="date-container">
          <input
  type="date"
  value={startDate}
  onChange={(e) => {
    setStartDate(e.target.value);
    setEndDate(""); // Reset end date to prevent conflicts
  }}
  placeholder="Start Date"
/>

<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  min={startDate} // Prevents selecting an earlier date
  placeholder="End Date"
/>
            <button onClick={handleDateFilter}>Filter by Date</button>
          </div>
        </div>

        <div className="totals-section">
          <h3>Total Sales: ₹{totalSales.toFixed(2)}</h3>
          <h3>Total Discount: ₹{totalDiscount.toFixed(2)}</h3>
          <h3>Total Profit: ₹{totalProfit.toFixed(2)}</h3>
        </div>

        <div>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Customer Name</th>
                <th>Amount After Discount</th>
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
                                {item.productName} - {item.rate} x {item.quantity} {item.unit}
                                {` (Cost: ₹${(item.costPrice).toFixed(2)})`}
                              </li>
                            ))
                          ) : (
                            <li>No products found</li>
                          )}
                        </ul>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(invoice.invoiceNumber)}
                          className="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No invoices found
                  </td>
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
