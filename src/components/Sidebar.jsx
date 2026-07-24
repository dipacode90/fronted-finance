import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // <-- 1. Tambahkan useNavigate

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate(); // <-- 2. Inisialisasi fungsi navigate

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/pengguna', label: 'Financial Goals' },
    { path: '/tabungan', label: 'Tabungan' },
  ];

  // Ambil data user yang login dari localStorage (diisi saat login berhasil)
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userName = storedUser?.name || 'User';
  const userRole = storedUser?.role || '';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  // 3. Fungsi untuk menangani aksi logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Alihkan langsung ke halaman login ('/')
    navigate('/');
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        
        {/* Bagian Atas: Logo & Navigasi (Sama seperti sebelumnya) */}
        <div>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <span className="text-xl font-bold tracking-wider text-blue-400">Targetku</span>
            <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => { if (isOpen) toggleSidebar(); }}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bagian Bawah: Profil & Tombol Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
              {userInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-none">{userName}</p>
              <span className="text-xs text-gray-400">{userRole}</span>
            </div>
          </div>
          
          {/* 4. Tambahkan onClick={handleLogout} pada tombol ini */}
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
      {isOpen && <div onClick={toggleSidebar} className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" />}
    </>
  );
}