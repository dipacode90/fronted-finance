import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // <-- 1. Tambahkan useNavigate

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate(); // <-- 2. Inisialisasi fungsi navigate

  // Ambil data user yang login dari localStorage (diisi saat login berhasil)
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const userName = storedUser?.name || storedUser?.nama || 'User';
  const userRole = storedUser?.role || '';

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
        </svg>
      ),
    },
    {
      path: '/pengguna',
      label: 'Financial Goals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.121 9.9a5 5 0 117.586 0A5.978 5.978 0 0012 17a5.978 5.978 0 00-2.343 2.536z" />
        </svg>
      ),
    },
    {
      path: '/tabungan',
      label: 'Tabungan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-9c-1.11 0-2.08.402-2.599 1M12 21a9 9 0 100-18 9 9 0 000 18z" />
        </svg>
      ),
    },
    ...(userRole === 'Admin'
      ? [
          {
            path: '/admin',
            label: 'Admin',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
          },
        ]
      : []),
  ];
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
                {item.icon}
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