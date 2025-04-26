import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Adminnaviagtion from '../Component/Adminnavigation';
import "../styles/Body.css";
import './List.css'; 

const SalesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [invoiceRes, orderRes, productRes, packageRes] = await Promise.all([
        axios.get('http://localhost:5000/api/invoices'),
        axios.get('http://localhost:5000/api/admin/bookings', { headers }),
        axios.get('http://localhost:5000/api/products', { headers }),
        axios.get('http://localhost:5000/api/packages', { headers }),
      ]);

      setInvoices(invoiceRes.data.invoices || []);
      setOrders(orderRes.data || []);
      setProducts(productRes.data || []);
      setPackages(packageRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const isWithinRange = (dateStr) => {
    const date = new Date(dateStr);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const month = selectedMonth ? parseInt(selectedMonth) : null;
    const year = selectedYear ? parseInt(selectedYear) : null;

    if (start && end) {
      return date >= start && date <= end;
    } else if (month !== null && year !== null) {
      return date.getMonth() === month && date.getFullYear() === year;
    }
    return true;
  };

  const filteredInvoices = invoices.filter(inv => isWithinRange(inv.invoiceDate));
  const deliveredOrders = orders.filter(o => o.status === 'delivered' && isWithinRange(o.createdAt));

  const calculateInvoiceProfit = (invoice) => {
    const totalCost = (invoice.items || []).reduce((sum, item) => sum + (item.costPrice || 0) * (item.quantity || 1), 0);
    return (invoice.amountAfterDiscount || 0) - totalCost;
  };

  const calculateOrderProfit = (order) => {
    let profit = 0;
    (order.items || []).forEach(item => {
      const pack = packages.find(p => p._id === item.packageId || p.name === item.name);
      if (!pack) return;
      (pack.products || []).forEach(({ productId, quantity }) => {
        const prod = products.find(p => p._id === productId._id);
        if (prod) {
          const unitsSold = (quantity || 0) * (item.quantity || 0);
          profit += (prod.sellingPrice - prod.costPrice) * unitsSold;
        }
      });
      const discountPerPack = (pack.totalPrice || 0) - (pack.finalPrice || 0);
      profit -= discountPerPack * (item.quantity || 0);
    });
    return profit;
  };

  const invoiceSales = filteredInvoices.reduce((sum, inv) => sum + (inv.amountAfterDiscount || 0), 0);
  const invoiceProfit = filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);
  const packageSales = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const packageProfit = deliveredOrders.reduce((sum, o) => sum + calculateOrderProfit(o), 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📊 Sales Report</h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <label>Start Date:</label><br />
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setSelectedMonth(''); setSelectedYear(''); }} max={today} />
          </div>
          <div>
            <label>End Date:</label><br />
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setSelectedMonth(''); setSelectedYear(''); }} max={today} />
          </div>
          <div>
            <label>Month:</label><br />
            <select value={selectedMonth} onChange={(e) => { setSelectedMonth(e.target.value); setStartDate(''); setEndDate(''); }}>
              <option value="">Select Month</option>
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Year:</label><br />
       

            <select value={selectedYear} onChange={(e) => { setSelectedYear(e.target.value); setStartDate(''); setEndDate(''); }}>
  <option value="">Select Year</option>
  {Array.from({ length: currentYear - 2020 }, (_, i) => currentYear - i).map(year => (
    <option key={year} value={year}>{year}</option>
  ))}
</select>
          </div>
        </div>

        {/* --- Top Summary --- */}
        <div className="totals-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div className="totals-box">
            <h3>Invoice Sales</h3>
            <p>Rs {invoiceSales.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Invoice Profit</h3>
            <p>Rs {invoiceProfit.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Package Sales</h3>
            <p>Rs {packageSales.toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Package Profit</h3>
            <p>Rs {packageProfit.toFixed(2)}</p>
          </div>
        </div>

        <div className="totals-container" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <div className="totals-box">
            <h3>Total Sales</h3>
            <p>Rs {(invoiceSales + packageSales).toFixed(2)}</p>
          </div>
          <div className="totals-box">
            <h3>Total Profit</h3>
            <p>Rs {(invoiceProfit + packageProfit).toFixed(2)}</p>
          </div>
        </div>

        {/* --- Invoice Table --- */}
        <h3 style={{ marginTop: '30px' }}>🧾 Invoice Details</h3>
        <table style={{ width: '100%', tableLayout: 'auto', backgroundColor: 'white', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Profit</th>
              <th>Invoice Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No Invoices</td></tr> :
              filteredInvoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.customerName}</td>
                  <td>Rs {inv.amountAfterDiscount?.toFixed(2)}</td>
                  <td>Rs {calculateInvoiceProfit(inv).toFixed(2)}</td>
                  <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* --- Package Table --- */}
        <h3 style={{ marginTop: '30px' }}>📦 Delivered Package Details</h3>
        <table style={{ width: '100%', tableLayout: 'auto', backgroundColor: 'white', marginTop: '10px' }}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Package Total</th>
              <th>Profit</th>
              <th>Delivery Date</th>
            </tr>
          </thead>
          <tbody>
            {deliveredOrders.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center' }}>No Delivered Orders</td></tr> :
              deliveredOrders.map(order => (
                <tr key={order._id}>
                  <td>{order.userName}</td>
                  <td>Rs {order.total?.toFixed(2)}</td>
                  <td>Rs {calculateOrderProfit(order).toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
