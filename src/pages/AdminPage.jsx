import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env?.REACT_APP_API_URL || 'http://localhost:8080';
const USERS_API_URL = `${API_BASE_URL}/api/users`;

const ROLE_OPTIONS = ['Admin', 'User'];

const emptyForm = { idUser: null, nama: '', email: '', password: '', role: 'User' };

export default function AdminPage() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isEditing = form.idUser !== null;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(USERS_API_URL, { headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengambil daftar pengguna');
      setUsers(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!storedUser?.idUser) {
      navigate('/');
      return;
    }
    if (storedUser?.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddDialog = () => {
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setForm({ idUser: user.idUser, nama: user.nama, email: user.email, password: '', role: user.role || 'User' });
    setIsDialogOpen(true);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama.trim() || !form.email.trim() || (!isEditing && !form.password.trim())) {
      alert('Mohon lengkapi semua kolom wajib!');
      return;
    }

    const payload = {
      nama: form.nama,
      email: form.email,
      role: form.role,
      ...(form.password.trim() ? { password: form.password } : {}),
    };

    try {
      const res = await fetch(isEditing ? `${USERS_API_URL}/${form.idUser}` : USERS_API_URL, {
        method: isEditing ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan pengguna');

      alert(isEditing ? 'Pengguna berhasil diperbarui!' : 'Pengguna berhasil ditambahkan!');
      closeDialog();
      loadUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (user) => {
    if (user.idUser === storedUser?.idUser) {
      alert('Anda tidak bisa menghapus akun Anda sendiri.');
      return;
    }
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.nama}"?`);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`${USERS_API_URL}/${user.idUser}`, { method: 'DELETE', headers: authHeaders });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal menghapus pengguna');

      alert('Pengguna berhasil dihapus!');
      loadUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm animate-pulse">Memuat data pengguna...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl max-w-md w-full text-center shadow-sm">
          <p className="font-bold mb-1">Koneksi Gagal</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h2>
        <button
          type="button"
          onClick={openAddDialog}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Tambah Pengguna
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">Nama</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.idUser} className="text-slate-700 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900">{u.nama}</td>
                  <td className="py-4 px-4 text-slate-500">{u.email}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditDialog(u)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-blue-600 tracking-wide">
                {isEditing ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-[11px] font-bold text-slate-500 tracking-wider">
              <div>
                <label className="block mb-2 uppercase">Nama</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 uppercase">
                  Kata Sandi {isEditing && <span className="normal-case font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  placeholder={isEditing ? '••••••••' : ''}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 uppercase">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
