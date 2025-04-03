import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './List.css'; // Import CSS for styling
import "../styles/Body.css";
import Adminnaviagtion from '../Component/Adminnavigation'; // Admin Navigation Component

const PurchaseList = ({ onPurchasesUpdate }) => {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    const totalPurchases = calculateTotalPurchases();
    if (typeof onPurchasesUpdate === 'function') {
      onPurchasesUpdate(totalPurchases);
    } else {
      console.warn('onPurchasesUpdate is not a function');
    }
  }, [filteredPurchases, onPurchasesUpdate]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchases');
      setPurchases(response.data.purchases || []);
      setFilteredPurchases(response.data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleDelete = async (purchaseNumber) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await axios.delete(`http://localhost:5000/api/purchases/${purchaseNumber}`);
        setPurchases((prev) => prev.filter((purchase) => purchase.purchaseNumber !== purchaseNumber));
        setFilteredPurchases((prev) => prev.filter((purchase) => purchase.purchaseNumber !== purchaseNumber));
      } catch (error) {
        console.error('Error deleting purchase:', error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = purchases.filter((purchase) =>
      purchase.purchaseNumber.toLowerCase().includes(query)
    );
    setFilteredPurchases(filtered);
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      const filteredByDate = purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
      });
      setFilteredPurchases(filteredByDate);
    }
  };

  const calculateTotalPurchases = () => {
    return filteredPurchases.reduce((total, purchase) => total + (purchase.amountAfterDiscount || 0), 0);
  };

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <h2>Purchase Orders List</h2>
        <div className="create-purchase-container">
          <button onClick={() => navigate('/purchases/create')}>Create Purchase Order</button>
          <p></p>
          <div className="search-container">
            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search by Purchase Order Number" />
          </div>
        </div>
        <div className="filter-container">
          <div className="date-container">
          <input
  type="date"
  value={startDate}
  onChange={(e) => {
    setStartDate(e.target.value);
    setEndDate(""); // Reset end date to avoid conflicts
  }}
/>

<input
  type="date"
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
  min={startDate} // Prevents selecting an invalid date
/>

            <button onClick={handleDateFilter}>Filter</button>
          </div>
        </div>
        <div className="total-sales">
          <h3>Total Purchases: ₹{calculateTotalPurchases().toFixed(2)}</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Supplier Name</th>
              <th>Amount After</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((purchase) => {
                const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString();
                return (
                  <tr key={purchase.purchaseNumber}>
                    <td>{purchase.purchaseNumber}</td>
                    <td>{formattedDate}</td>
                    <td>{purchase.supplierName}</td>
                    <td>₹{purchase.amountAfterDiscount?.toFixed(2)}</td>
                    <td>
                      <ul>
                        {purchase.items && purchase.items.length > 0 ? (
                          purchase.items.map((item, index) => (
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
                      <button onClick={() => handleDelete(purchase.purchaseNumber)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No purchase orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList;
