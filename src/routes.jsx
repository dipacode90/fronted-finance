import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// import Pengguna from './pages/Pengguna';
import Login from './pages/Login';
import Register from './pages/Register';
import FormFinancialGoals from './pages/FormFinancialGoals';
import TabunganPage from './pages/TabunganPage';
import AdminPage from './pages/AdminPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Jadikan halaman Login sebagai halaman utama ("/") */}
      <Route path="/" element={<Login />} />

      {/* Halaman Registrasi/Signup */}
      <Route path="/register" element={<Register />} />

      {/* 2. Pindahkan halaman Dashboard ke jalur baru (misal: "/dashboard") */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* 3. Halaman lainnya tetap */}
      <Route path="/pengguna" element={<FormFinancialGoals />} />

      <Route path="/tabungan" element={<TabunganPage />} />

      {/* Halaman Admin: manajemen pengguna (dijaga role Admin di dalam komponennya) */}
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}