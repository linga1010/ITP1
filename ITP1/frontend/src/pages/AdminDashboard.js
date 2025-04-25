import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Component/Adminnavigation';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const handleStartDateChange = (value) => {
    setStartDate(value);

    if (value > today) {
      setStartDateError("Start date cannot be after today");
    } else if (endDate && new Date(value) > new Date(endDate)) {
      setStartDateError("Start date cannot be after end date");
      setEndDateError("");
    } else {
      setStartDateError("");
      setEndDateError("");
    }
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);

    if (value > today) {
      setEndDateError("End date cannot be after today");
    } else if (startDate && new Date(value) < new Date(startDate)) {
      setEndDateError("End date cannot be before start date");
      setStartDateError("");
    } else {
      setEndDateError("");
      setStartDateError("");
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStartDateError('');
    setEndDateError('');
    fetchInvoiceData();
    fetchPackageData();
  };

  const [invoiceSales, setInvoiceSales] = useState(0);
  const [invoiceProfit, setInvoiceProfit] = useState(0);
  const [packageSales, setPackageSales] = useState(0);
  const [packageProfit, setPackageProfit] = useState(0);

  useEffect(() => {
    if (startDateError || endDateError) return;
    fetchInvoiceData();
    fetchPackageData();
  }, [startDate, endDate, startDateError, endDateError]);

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
        const cost = (inv.items || []).reduce((sum, item) => sum + (item.costPrice || 0) * (item.quantity || 1), 0);
        totalProfit += sale - cost;
      });

      setInvoiceSales(totalSales);
      setInvoiceProfit(totalProfit);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchPackageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

  const calculatePackageSalesAndProfit = (orders, products, packs) => {
    let sales = 0;
    let profit = 0;
    const delivered = (orders || []).filter(o => o.status === 'delivered');
    const filtered = filterByDate(delivered, 'createdAt');

    filtered.forEach(order => {
      sales += order.total || 0;
      (order.items || []).forEach(item => {
        const pack = packs.find(p => p._id === item.packageId || p.name === item.name);
        if (!pack) return;

        let itemProfit = 0;
        (pack.products || []).forEach(({ productId, quantity }) => {
          const prod = products.find(p => p._id === productId._id);
          if (prod) {
            const unitsSold = (quantity || 0) * (item.quantity || 0);
            itemProfit += (prod.sellingPrice - prod.costPrice) * unitsSold;
          }
        });

        const discountPerPack = (pack.totalPrice || 0) - (pack.finalPrice || 0);
        itemProfit -= discountPerPack * (item.quantity || 0);
        profit += itemProfit;
      });
    });

    setPackageSales(sales);
    setPackageProfit(profit);
  };

  const filterByDate = (arr, field) => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return arr.filter(item => {
      const d = new Date(item[field]);
      return (!start || d >= start) && (!end || d <= end);
    });
  };

  const barChartData = {
    labels: ['Invoice Sales', 'Invoice Profit', 'Package Sales', 'Package Profit'],
    datasets: [
      {
        label: 'Amount Rs',
        data: [
          Number(invoiceSales || 0),
          Number(invoiceProfit || 0),
          Number(packageSales || 0),
          Number(packageProfit || 0)
        ],
        backgroundColor: ['#36A2EB', '#4bc0c0', '#FFCE56', '#FF6384'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Rs ${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `Rs ${value}`;
          }
        }
      }
    }
  };

  return (
    <>
      <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="admin-dashboard" style={{ marginTop: '80px' }}>
        <h2 className="dashboard-title">WELCOME TO THE ADMIN DASHBOARD</h2>

        <div className="date-filter-row">
          <div className="date-field">
            <label><strong>Start Date:</strong></label>
            <input type="date" value={startDate} max={today} onChange={e => handleStartDateChange(e.target.value)} />
            {startDateError && <p style={{ color: 'red' }}>{startDateError}</p>}
          </div>

          <div className="date-field">
            <label><strong>End Date:</strong></label>
            <input type="date" value={endDate} max={today} onChange={e => handleEndDateChange(e.target.value)} />
            {endDateError && <p style={{ color: 'red' }}>{endDateError}</p>}
          </div>

          <button onClick={clearFilters} className="clear-btn">Clear Data</button>
        </div>

        <div className="summary-row">
          <div className="summary-box gradient-blue">
            <h4>Invoice Summary</h4>
            <p>Total Invoice Sales: Rs {invoiceSales.toFixed(2)}</p>
            <p>Total Invoice Profit: Rs {invoiceProfit.toFixed(2)}</p>
          </div>
          <div className="summary-box gradient-green">
            <h4>Package Summary</h4>
            <p>Total Package Sales: Rs {packageSales.toFixed(2)}</p>
            <p>Total Package Profit: Rs {packageProfit.toFixed(2)}</p>
          </div>
          <div className="summary-box gradient-orange">
            <h4>Total Summary</h4>
            <p>Total Sales: Rs {(invoiceSales + packageSales).toFixed(2)}</p>
            <p>Total Profit: Rs {(invoiceProfit + packageProfit).toFixed(2)}</p>
          </div>
        </div>

        <div className="chart-box full-width">
          <h4>Sales & Profit Comparison</h4>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
