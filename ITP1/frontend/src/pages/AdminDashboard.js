import React, { useState } from 'react';
import Navbar from '../Component/Adminnavigation';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="main-content">
      <section className="dashboard-info">
        <Navbar onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Dashboard welcome section */}
        <div className="dashboard-welcome">
          <h1>Welcome to the Admin Dashboard</h1>
          {/* Add dynamic content here */}
        </div>

        {/* Dashboard main content */}
        <p>Manage your sections here...</p>
        
        {/* Additional content or components can go here */}
      </section>

      {/* Optionally render sidebar if open */}
      {isSidebarOpen && (
        <div className="sidebar">
          {/* Sidebar content */}
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
