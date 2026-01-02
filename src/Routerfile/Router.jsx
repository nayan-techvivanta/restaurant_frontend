import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/main/Dashboard";
import Layout from "../layout/Layout";
import CreateOrder from "../pages/main/CreateOrder";
import OrderList from "../pages/main/OrderList";
import MenuManagement from "../pages/main/MenuManagement";
import Settings from "../pages/main/Settings";
import PrintReceipt from "../components/Order/PrintReceipt";
import VerifyOtp from "../pages/auth/VerifyOtp";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyemail/:userId" element={<VerifyOtp />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/create_order" element={<CreateOrder />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/print-receipt" element={<PrintReceipt />} />
      </Routes>
    </Router>
  );
}
