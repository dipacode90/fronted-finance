import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // <-- Import useLocation
import Sidebar from './components/Sidebar';
import AppRoutes from './routes';

// Judul navbar per halaman (samakan dengan label menu di Sidebar)
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/pengguna': 'Financial Goals',
  '/tabungan': 'Tabungan',
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Mendapatkan data URL aktif saat ini

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const pageTitle = PAGE_TITLES[location.pathname] || 'Aplikasi Panel';

  // Cek apakah halaman saat ini adalah halaman login
  // const isLoginPage = location.pathname === '/login';
  // Ubah logika pengecekan: Sekarang halaman login adalah halaman utama ('/')
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  // JIKA DI HALAMAN LOGIN/REGISTER: Langsung render tanpa sidebar/navbar
  if (isAuthPage) {
    return <AppRoutes />;
  }

  // JIKA DI HALAMAN UTAMA/DASHBOARD: Render lengkap dengan sidebar
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          </div>
        </header>

        <main className="flex-1 p-8 bg-slate-50 overflow-y-auto">
          <AppRoutes /> 
        </main>
      </div>
    </div>
  );
}