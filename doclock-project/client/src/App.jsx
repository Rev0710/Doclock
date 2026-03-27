import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { AppointmentProvider } from "./context/AppointmentContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BookAppointment from "./pages/BookAppointment.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

import "./index.css";

// ✅ wrapper component so we can use useLocation
function LayoutWrapper() {
  const location = useLocation();

  // Pages where we hide Navbar/Footer
  const hideNavbarFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/book");

  return (
    <>
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Routes */}
        <Route element={<ProtectedRoute allowedRoles={["patient", "admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book/:doctorId?" element={<BookAppointment />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideNavbarFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <BrowserRouter>
          <LayoutWrapper />
        </BrowserRouter>
      </AppointmentProvider>
    </AuthProvider>
  );
}