//App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminManageUsers from './pages/AdminManageUsers';
import UserHomePage from './pages/UserHomePage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AddProduct from './invontorypage/AddProduct';
import ProductList from './invontorypage/ProductList';
import HomePage from './pages/HomePage';
import PackageList from './invontorypage/PackageList';
import AddPackage from './invontorypage/AddPackage';
import EditProduct from './invontorypage/EditProduct';
import EditPackage from './invontorypage/EditPackage';
import ViewPackage from './invontorypage/ViewPackage';
import Createinvoice from './invontorypage/CreateInvoice';
import Invoices from './invontorypage/InvoiceList';
import OrderPage from './OrderPages/Order';
import PaymentDetails from './OrderPages/Payment'
import OrderHistoryPage from './OrderPages/OrderHistory';
import ViewBookings from './OrderPages/VeiwBookings';
import FeedbackPage from './Feedback/pages/FeedbackPage';
import ViewProfilePage from './pages/ViewProfilePage';
import AdminDeletedUsers from './pages/AdminDeletedUsers';

import AdminFeedbackPage from './Feedback/pages/AdminFeedbackPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/view-profile" element={<ViewProfilePage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user-home" element={<UserHomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-users" element={<AdminManageUsers />} />
        <Route path="/protected" element={<Navigate to="/login" />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/packages" element={<PackageList />} />
          <Route path="/add-package" element={<AddPackage />} />
          <Route path="/edit-package/:id" element={<EditPackage />} />
          <Route path="/view-package" element={<ViewPackage />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/PaymentDetails" element={<PaymentDetails />}/>
          <Route path="/OrderHistoryDetails" element={<OrderHistoryPage  />}/>
          <Route path="/admin/view-bookings" element={<ViewBookings />} />
          <Route path="/create-invoice" element={<Createinvoice />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/Feedback" element={<FeedbackPage />} />
          <Route path="/adminFeedback" element={<AdminFeedbackPage />} />
          <Route path="/admin/deleted-users" element={<AdminDeletedUsers />} />


      </Routes>
    </Router>
  );
}

export default App;
