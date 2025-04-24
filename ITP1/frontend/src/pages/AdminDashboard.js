import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Component/Adminnavigation';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // invoice metrics
  const [invoiceSales, setInvoiceSales] = useState(0);
  const [invoiceProfit, setInvoiceProfit] = useState(0);

  // package metrics
  const [packageSales, setPackageSales] = useState(0);
  const [packageProfit, setPackageProfit] = useState(0);

  // re-fetch whenever filters change
  useEffect(() => {
    fetchInvoiceData();
    fetchPackageData();
  }, [startDate, endDate]);

  // === INVOICE DATA ===
  const fetchInvoiceData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/invoices');
      const invoices = data.invoices || [];
      const filtered = filterByDate(invoices, 'invoiceDate');

      let totalSales = 0;
      let totalProfit = 0;

      filtered.forEach(inv => {
        const sale = inv.amountAfterDiscount || 0;
        totalSales += sale;

        // cost = sum of (costPrice * qty) per item
        const cost = (inv.items || [])
          .reduce((sum, item) => sum + (item.costPrice || 0) * (item.quantity || 1), 0);

        totalProfit += sale - cost;
      });

      setInvoiceSales(totalSales);
      setInvoiceProfit(totalProfit);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  // === PACKAGE DATA ===
  const fetchPackageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // fetch all three in parallel
      const [ordersRes, productsRes, packagesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/bookings', { headers }),
        axios.get('http://localhost:5000/api/products', { headers }),
        axios.get('http://localhost:5000/api/packages', { headers }),
      ]);

      const allOrders = ordersRes.data || [];
      const products = productsRes.data || [];
      const packs = packagesRes.data || [];

      calculatePackageSalesAndProfit(allOrders, products, packs);
    } catch (err) {
      console.error('Error fetching package data:', err);
    }
  };

  // helper to compute sales & profit from bookings
  const calculatePackageSalesAndProfit = (orders, products, packs) => {
    let sales = 0;
    let profit = 0;

    // only delivered
    const delivered = (orders || []).filter(o => o.status === 'delivered');
    // then date filter
    const filtered = filterByDate(delivered, 'createdAt');

    filtered.forEach(order => {
      sales += order.total || 0;

      (order.items || []).forEach(item => {
        // find the matching package
        const pack = packs.find(p => p._id === item.packageId || p.name === item.name);
        if (!pack) return;

        // compute profit on each underlying product
        let itemProfit = 0;
        (pack.products || []).forEach(({ productId, quantity }) => {
          const prod = products.find(p => p._id === productId);
          if (prod) {
            // units sold = quantity per pack * how many packs in this order
            const unitsSold = (quantity || 0) * (item.quantity || 0);
            itemProfit += (prod.sellingPrice - prod.costPrice) * unitsSold;
          }
        });

        // subtract discount
        const discountPerPack = (pack.totalPrice || 0) - (pack.finalPrice || 0);
        itemProfit -= discountPerPack * (item.quantity || 0);

        profit += itemProfit;
      });
    });

    setPackageSales(sales);
    setPackageProfit(profit);
  };

  // date‐range filter helper
  const filterByDate = (arr, field) => {
    const start = startDate ? new Date(startDate) : null;
    const end   = endDate   ? new Date(endDate)   : null;
    return arr.filter(item => {
      const d = new Date(item[field]);
      return (!start || d >= start) && (!end || d <= end);
    });
  };

  // prepare pie charts
  const salesPieData = {
    labels: ['Invoice Sales', 'Package Sales'],
    datasets: [{
      label: 'Sales Distribution',
      data: [invoiceSales, packageSales],
      backgroundColor: ['#36A2EB', '#FFCE56'],
    }],
  };

  const profitPieData = {
    labels: ['Invoice Profit', 'Package Profit'],
    datasets: [{
      label: 'Profit Distribution',
      data: [invoiceProfit, packageProfit],
      backgroundColor: ['#36A2EB', '#FF6384'],
    }],
  };

  return (
    <>
      <div style={{ marginTop: '40px' }} />
      <main className="main-content">
        <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <section className="dashboard-info">
          <div className="dashboard-welcome">
            <h1>Welcome to the Admin Dashboard</h1>
          </div>

          <div className="filter-container">
            <label>
              Start Date: 
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ marginLeft: '1rem' }}>
              End Date: 
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div className="totals-section">
            <h3>Total Invoice Sales: ₹{invoiceSales.toFixed(2)}</h3>
            <h3>Total Package Sales: ₹{packageSales.toFixed(2)}</h3>
            <h3>Total Sales: ₹{(invoiceSales + packageSales).toFixed(2)}</h3>

            <h3>Total Invoice Profit: ₹{invoiceProfit.toFixed(2)}</h3>
            <h3>Total Package Profit: ₹{packageProfit.toFixed(2)}</h3>
            <h3>Total Profit: ₹{(invoiceProfit + packageProfit).toFixed(2)}</h3>
          </div>

          <div className="chart-section" style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <h3>Sales Distribution</h3>
            <Pie data={salesPieData} />

            <h3 style={{ marginTop: '2rem' }}>Profit Distribution</h3>
            <Pie data={profitPieData} />
          </div>
        </section>

        {isSidebarOpen && <div className="sidebar">{/* Sidebar content */}</div>}
      </main>
    </>
  );
};

export default AdminDashboard;
