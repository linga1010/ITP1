import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import Adminnaviagtion from "../Component/Adminnavigation"; 
import '../styles/AdminSummary.css'; // Import CSS for styling

const AdminSummary = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const [userSummary, setUserSummary] = useState([]);
  const [chartData, setChartData] = useState({});

  // Check if the user is an admin
  const verifyAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if no token is found
      return;
    }

    try {
      // Verify the user role (admin)
      const res = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.isAdmin) {
        // If the user is not an admin, redirect to home or another page
        navigate('/user-home'); // Redirect to non-admin user page
      } else {
        // If admin, fetch the user summary data
        fetchUserSummary(token);
      }
    } catch (err) {
      console.error('Error verifying admin:', err);
      localStorage.removeItem('token');
      navigate('/login'); // Redirect to login if verification fails
    }
  };

  // Fetch user summary data
  const fetchUserSummary = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/user-summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserSummary(res.data);

      // Prepare chart data
      const dates = res.data.map(item => item._id);
      const totalUsers = res.data.map(item => item.totalUsers);

      // Creating a gradient color for the line (blue to red)
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
            borderColor: gradient, // Apply gradient
            backgroundColor: 'rgba(75,192,192,0.2)', // Add semi-transparent background
            fill: true,
            tension: 0.1, // Adds curve to the line
            pointRadius: 5, // Larger points for better visibility
            pointHoverRadius: 7, // Larger hover points for interaction
          }
        ]
      });
      
    } catch (error) {
      console.error('Error fetching user summary:', error);
      alert('❌ Error fetching user summary');
    }
  };

  useEffect(() => {
    verifyAdminAccess(); // Call the function to verify if the user is an admin
  }, []); // Empty dependency array ensures it runs only once

  return (
    <div className="admin-summary-container">
      <Adminnaviagtion />
      <h2 className="admin-summary-title">User Summary</h2>

      {/* User Table */}
      <div className="admin-summary-user-details">
        <h3 className="admin-summary-heading">Users Joined</h3>
        {userSummary && userSummary.length > 0 ? (
          <table className="admin-summary-user-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Users Joined</th>
                <th>User Details</th>
              </tr>
            </thead>
            <tbody>
              {userSummary.map((item, index) => (
                <tr key={index}>
                  <td>{item._id}</td>
                  <td>{item.totalUsers}</td>
                  <td>
                    <ul>
                      {item.users.map((user, i) => (
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

      {/* User Summary Graph */}
      <div className="admin-summary-chart-container">
        {userSummary && userSummary.length > 0 ? (
          <Line data={chartData} options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return `Users: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date',
                  font: {
                    weight: 'bold' // Make the X-axis title bold
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Number of Users',
                  font: {
                    weight: 'bold' // Make the Y-axis title bold
                  }
                },
                min: 0, // Set minimum value for y-axis
                ticks: {
                  stepSize: 1, // Ensure whole numbers
                  beginAtZero: true, // Start from zero on the y-axis
                }
              }
            }
          }} />
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default AdminSummary;
