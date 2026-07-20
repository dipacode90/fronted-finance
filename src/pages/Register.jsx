import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:8080/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrasi gagal, silakan coba lagi.');
        return;
      }

      alert(data.message || 'Registrasi berhasil! Silakan masuk.');
      navigate('/');
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100">

        {/* Header Form */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 tracking-wide">Targetku</h2>
          <p className="mt-2 text-base text-gray-500 font-medium">
            Daftar untuk mulai mengelola tabungan Anda
          </p>
        </div>

        {/* Form Registrasi */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">
              NAMA LENGKAP
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-700 bg-gray-50 placeholder-gray-400"
              placeholder="Nama Anda"
            />
          </div>

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

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">
              KONFIRMASI KATA SANDI
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-700 bg-gray-50 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          {/* Tombol Submit Biru */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Daftar Akun'}
            </button>
          </div>
        </form>

        {/* Footer Tautan Login */}
        <div className="text-center mt-6 text-sm text-gray-500 font-medium">
          Sudah punya akun?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 font-bold hover:underline"
          >
            Masuk di Sini
          </button>
        </div>

      </div>
    </div>
  );
}
