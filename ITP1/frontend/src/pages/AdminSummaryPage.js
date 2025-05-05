import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Adminnaviagtion from "../Component/Adminnavigation";
import '../styles/AdminSummary.css';

const AdminSummary = () => {
  const navigate = useNavigate();
  const [userSummary, setUserSummary] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [monthlyChartData, setMonthlyChartData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const verifyAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.isAdmin) {
        navigate('/user-home');
      } else {
        fetchUserSummary(token);
      }
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const fetchUserSummary = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/user-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data || [];
      setUserSummary(data);
      setFilteredSummary(data);

      const dates = data.map(item => item._id);
      const totalUsers = data.map(item => item.totalUsers);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'blue');
      gradient.addColorStop(1, 'red');

      setChartData({
        labels: dates,
        datasets: [
          {
            label: 'Users Joined',
            data: totalUsers,
            borderColor: gradient,
            backgroundColor: 'rgba(75,192,192,0.2)',
            fill: true,
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      });

      const monthlyMap = {};
      data.forEach(item => {
        const date = new Date(item._id);
        if (!isNaN(date)) {
          const month = date.toLocaleString('default', { month: 'long' });
          if (!monthlyMap[month]) {
            monthlyMap[month] = 0;
          }
          monthlyMap[month] += item.totalUsers;
        }
      });

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const monthCounts = months.map(month => monthlyMap[month] || 0);

      setMonthlyChartData({
        labels: months,
        datasets: [
          {
            label: 'Users Joined Per Month',
            data: monthCounts,
            borderColor: '#ff7f50',
            backgroundColor: 'rgba(255,127,80,0.2)',
            fill: true,
            tension: 0.2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching user summary:', error);
      alert('❌ Error fetching user summary');
    }
  };

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredSummary(userSummary);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = userSummary.filter(item => {
      const dateMatch = item._id.toLowerCase().includes(lowerSearch);
      const userMatch = Array.isArray(item.users) && item.users.some(user =>
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      );
      const monthMatch = new Date(item._id).toLocaleString('default', { month: 'long' }).toLowerCase().includes(lowerSearch);

      return dateMatch || userMatch || monthMatch;
    });

    setFilteredSummary(filtered);
  }, [searchTerm, userSummary]);

  return (
    <div className="admin-summary-container">
      <Adminnaviagtion />

      
      <p className="admin-summary-title">User Summary</p>

      <h3 className="admin-summary-heading">📅 Daily User Join Summary</h3>
      <div className="admin-summary-chart-container">
        {chartData ? (
          <Line data={chartData} options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `Users: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Date', font: { weight: 'bold' } }
              },
              y: {
                title: { display: true, text: 'Number of Users', font: { weight: 'bold' } },
                min: 0,
                ticks: { stepSize: 1, beginAtZero: true }
              }
            }
          }} />
        ) : <p>Loading chart...</p>}
      </div>

      <h3 className="admin-summary-heading">📅 Monthly User Join Summary</h3>
      <div className="admin-summary-chart-container">
        {monthlyChartData ? (
          <Line data={monthlyChartData} options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `Users: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Month', font: { weight: 'bold' } }
              },
              y: {
                title: { display: true, text: 'Number of Users', font: { weight: 'bold' } },
                min: 0,
                ticks: { stepSize: 1, beginAtZero: true }
              }
            }
          }} />
        ) : <p>Loading monthly chart...</p>}
      </div>

      <div className="admin-summary-search-box">
        <input
          type="text"
          placeholder="Search by date, name, email, or month"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-summary-search-input"
        />
        {searchTerm && (
          <p className="search-count">
            🔍 {filteredSummary.length} result{filteredSummary.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      

      <div className="admin-summary-user-details">
  <h3 className="admin-summary-heading">Users Joined</h3>
  <div className="admin-summary-table-wrapper">
    {filteredSummary.length > 0 ? (
      <table className="admin-summary-user-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Users Joined</th>
                <th>User Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((item, index) => (
                <tr key={index}>
                  <td>{item._id}</td>
                  <td>{item.totalUsers}</td>
                  <td>
                    <ul>
                      {Array.isArray(item.users) && item.users.map((user, i) => (
                        <li key={i}>
                          Name: {user.name}, Email: {user.email}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users data available.</p>
        )}
      </div>
      </div>

      
    </div>
  );
};

export default AdminSummary;
