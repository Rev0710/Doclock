import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { AppointmentProvider } from './context/AppointmentContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './sections/Landing.jsx';
import Login from './sections/Login.jsx';
import Register from './sections/Register.jsx';
import UploadPhoto from './sections/uploadPhoto.jsx';
import Home from './sections/Home.jsx';
import SerApntmt from './sections/serApntmt.jsx';
import Available from './sections/Available.jsx';
import Booked from './sections/Booked.jsx';
import Appointments from './sections/Appointments.jsx';
import HealthRecord from './sections/HealthRecord.jsx';
import Admin from './sections/admin.jsx';

import './index.css';

const signedInRoles = ['user', 'patient', 'admin', 'doctor', 'staff'];

export default function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute allowedRoles={signedInRoles} />}>
              <Route path="/upload-photo" element={<UploadPhoto />} />
              <Route path="/home" element={<Home />} />
              <Route path="/health-record" element={<HealthRecord />} />
              <Route path="/set-appointment" element={<SerApntmt />} />
              <Route path="/available" element={<Available />} />
              <Route path="/booked" element={<Booked />} />
              <Route path="/appointments" element={<Appointments />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppointmentProvider>
    </AuthProvider>
  );
}
