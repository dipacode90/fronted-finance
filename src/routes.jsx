import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// import Pengguna from './pages/Pengguna';
import Login from './pages/Login';
import Register from './pages/Register';
import FormFinancialGoals from './pages/FormFinancialGoals';
import TabunganPage from './pages/TabunganPage';
import AdminPage from './pages/AdminPage';
import PrediksiPage from './pages/PrediksiPage';

// Halaman khusus User: Admin yang mencoba membukanya dialihkan ke halaman Admin
function UserOnly({ children }) {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  if (storedUser?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Jadikan halaman Login sebagai halaman utama ("/") */}
      <Route path="/" element={<Login />} />

      {/* Halaman Registrasi/Signup */}
      <Route path="/register" element={<Register />} />

      {/* 2. Pindahkan halaman Dashboard ke jalur baru (misal: "/dashboard") */}
      <Route path="/dashboard" element={<UserOnly><Dashboard /></UserOnly>} />

      {/* 3. Halaman lainnya tetap */}
      <Route path="/pengguna" element={<UserOnly><FormFinancialGoals /></UserOnly>} />

      <Route path="/tabungan" element={<UserOnly><TabunganPage /></UserOnly>} />

      {/* Halaman prediksi tabungan (Single Exponential Smoothing) */}
      <Route path="/prediksi" element={<UserOnly><PrediksiPage /></UserOnly>} />

      {/* Halaman Admin: manajemen pengguna (dijaga role Admin di dalam komponennya) */}
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}