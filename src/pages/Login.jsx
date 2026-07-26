import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ambil Base URL dari Environment Variable (Create React App)
// Jika variabel env tidak terdefinisi (saat lokal), fallback ke http://localhost:8080
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const BASE_URL = `${API_BASE_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Email atau password salah!');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Container utama dengan rounded-2xl besar dan bayangan lembut */}
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Header Form */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 tracking-wide">Targetku</h2>
          <p className="mt-2 text-base text-gray-500 font-medium">
            Masuk untuk mengelola tabungan dan <em>financial goals</em> Anda
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">
              ALAMAT EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-700 bg-gray-50 placeholder-gray-400"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">
              KATA SANDI
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-700 bg-gray-50 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          {/* Tombol Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk Aplikasi'}
            </button>
          </div>
        </form>

        {/* Footer Tautan Daftar */}
        <div className="text-center mt-6 text-sm text-gray-500 font-medium">
          Belum punya akun?{' '}
          <button 
            onClick={() => navigate('/register')} 
            className="text-blue-600 font-bold hover:underline"
          >
            Daftar Sekarang
          </button>
        </div>

      </div>
    </div>
  );
}