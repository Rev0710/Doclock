import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

import './index.css'
import './components/Navbar.css'
import './components/Footer.css'
import './pages/Login.css'
import './pages/Dashboard.css'
import './pages/BookAppointment.css'
import './pages/AdminPanel.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book/:doctorId?" element={<BookAppointment />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

      </BrowserRouter>
    </AuthProvider>
  )
}