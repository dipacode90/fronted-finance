import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Konstanta API Backend
const BASE_URL = process.env.REACT_APP_FINANCE_URL || "http://localhost:8080/api/finance";

export default function FormFinancialGoals() {
  const navigate = useNavigate();

  // ID User diambil dari data akun yang sedang login
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const USER_ID = storedUser?.idUser;

  // State data riwayat goals dari database
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Input Form (Tambah Data)
  const [namaGoal, setNamaGoal] = useState('');
  const [targetNominal, setTargetNominal] = useState('');
  const [targetTanggal, setTargetTanggal] = useState('');
  const [prioritas, setPrioritas] = useState('Sedang');
  const [deskripsi, setDeskripsi] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ================= STATE UNTUK EDIT/UPDATE =================
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editIdGoal, setEditIdGoal] = useState(null);
  const [editNamaGoal, setEditNamaGoal] = useState('');
  const [editTargetNominal, setEditTargetNominal] = useState('');
  const [editTargetTanggal, setEditTargetTanggal] = useState('');
  const [editPrioritas, setEditPrioritas] = useState('Sedang');
  const [editDeskripsi, setEditDeskripsi] = useState('');

  // 1. Ambil daftar goals dari backend saat halaman dimuat
  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/get-financial-goals?idUser=${USER_ID}`);
      if (!res.ok) throw new Error("Gagal mengambil data goals");
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading goals:", error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!USER_ID) {
      navigate('/');
      return;
    }
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Handle pengiriman form ke backend (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaGoal || !targetNominal || !targetTanggal) {
      alert("Mohon isi semua kolom wajib!");
      return;
    }

    const payload = {
      idUser: USER_ID,
      namaGoal: namaGoal,
      targetNominal: parseFloat(targetNominal),
      targetTanggal: targetTanggal,
      prioritas: prioritas,
      deskripsi: deskripsi,
    };

    try {
      const response = await fetch(`${BASE_URL}/save-financial-goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menyimpan ke database");

      alert("Goal berhasil disimpan!");
      
      // Reset Form
      setNamaGoal('');
      setTargetNominal('');
      setTargetTanggal('');
      setPrioritas('Sedang');
      setDeskripsi('');

      loadGoals();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // 3. Fungsi membuka Dialog Edit dan memasukkan data lama ke form edit
  const openEditModal = (goal) => {
    setEditIdGoal(goal.idGoal);
    setEditNamaGoal(goal.namaGoal || '');
    setEditTargetNominal(goal.targetNominal || '');
    setEditTargetTanggal(goal.targetTanggal || '');
    setEditPrioritas(goal.prioritas || 'Sedang');
    setEditDeskripsi(goal.deskripsi || '');
    setIsEditOpen(true);
  };

  // 4. Handle pengiriman update ke backend (PUT/POST update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editNamaGoal || !editTargetNominal || !editTargetTanggal) {
      alert("Mohon isi semua kolom wajib!");
      return;
    }

    const payload = {
      idGoal: editIdGoal,
      idUser: USER_ID,
      namaGoal: editNamaGoal,
      targetNominal: parseFloat(editTargetNominal),
      targetTanggal: editTargetTanggal,
      prioritas: editPrioritas,
      deskripsi: editDeskripsi,
    };

    try {
      const response = await fetch(`${BASE_URL}/save-financial-goals`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal memperbarui database");

      alert("Goal berhasil diperbarui!");
      setIsEditOpen(false);
      loadGoals();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (idGoal) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus goal ini?")) {
      try {
        const res = await fetch(`${BASE_URL}/delete-financial-goals?idGoal=${idGoal}`, {
          method: "DELETE"
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Gagal menghapus data");
        
        alert(data.message);
        loadGoals();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  // Helper formatting Rupiah
  const formatRupiah = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return "Rp " + Math.round(value).toLocaleString("id-ID");
  };

  // Filter pencarian lokal di client-side
  const filteredGoals = goals.filter((goal) =>
    goal.namaGoal?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-slate-400 text-sm animate-pulse">Memuat target keuangan...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 relative">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Goals</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ================= BLOK KIRI: DAFTAR DATA ================= */}
        <div className="xl:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Cari Nama Goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xs px-5 py-2.5 text-sm border border-slate-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white placeholder-slate-400 shadow-inner"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-4 pr-4">Nama Goals</th>
                  <th className="pb-4 px-4">Target Nominal</th>
                  <th className="pb-4 px-4">Target Tanggal</th>
                  <th className="pb-4 px-4 text-center">Prioritas</th>
                  <th className="pb-4 px-4">Deskripsi</th>
                  <th className="pb-4 pl-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGoals.map((goal) => (
                  <tr key={goal.idGoal} className="text-slate-700">
                    <td className="py-5 pr-4 font-bold text-slate-900 max-w-[140px] break-words">
                      {goal.namaGoal}
                    </td>
                    <td className="py-5 px-4 text-slate-500 whitespace-nowrap">
                      {formatRupiah(goal.targetNominal)}
                    </td>
                    <td className="py-5 px-4 text-slate-500 whitespace-nowrap">
                      {goal.targetTanggal}
                    </td>
                    <td className="py-5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                          goal.prioritas === 'Tinggi'
                            ? 'bg-rose-50 text-rose-500'
                            : goal.prioritas === 'Sedang'
                            ? 'bg-amber-50 text-amber-500'
                            : 'bg-emerald-50 text-emerald-500'
                        }`}
                      >
                        {goal.prioritas}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-slate-400 max-w-[150px] break-words">
                      {goal.deskripsi || '-'}
                    </td>
                    {/* KOLOM AKSI DENGAN TOMBOL EDIT & HAPUS */}
                    <td className="py-5 pl-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(goal)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(goal.idGoal)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGoals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Tidak ada goals keuangan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= BLOK KANAN: FORM INPUT TAMBAH ================= */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm border-t-[3px] border-t-blue-500">
          <h3 className="text-base font-bold text-blue-600 mb-6 tracking-wide">Form Add Goals</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-[11px] font-bold text-slate-500 tracking-wider">
            <div>
              <label className="block mb-2 uppercase">Nama Goals</label>
              <input
                type="text"
                required
                placeholder="Contoh: Beli Laptop"
                value={namaGoal}
                onChange={(e) => setNamaGoal(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white placeholder-slate-300"
              />
            </div>

            <div>
              <label className="block mb-2 uppercase">Target Nominal</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-normal text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  value={targetNominal}
                  onChange={(e) => setTargetNominal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 uppercase">Target Tanggal</label>
              <input
                type="date"
                required
                value={targetTanggal}
                onChange={(e) => setTargetTanggal(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 uppercase">Prioritas</label>
              <select
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
              >
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 uppercase">Deskripsi</label>
              <textarea
                rows="3"
                placeholder="Rincian tujuan..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white placeholder-slate-300 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Simpan Goals
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ================= DIALOG / MODAL UPDATE ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-100 shadow-xl border-t-[3px] border-t-amber-500 transform transition-all">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-amber-600 tracking-wide">Update Financial Goal</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-[11px] font-bold text-slate-500 tracking-wider">
              <div>
                <label className="block mb-1.5 uppercase">Nama Goals</label>
                <input
                  type="text"
                  required
                  value={editNamaGoal}
                  onChange={(e) => setEditNamaGoal(e.target.value)}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase">Target Nominal</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-normal text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editTargetNominal}
                    onChange={(e) => setEditTargetNominal(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase">Target Tanggal</label>
                <input
                  type="date"
                  required
                  value={editTargetTanggal}
                  onChange={(e) => setEditTargetTanggal(e.target.value)}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase">Prioritas</label>
                <select
                  value={editPrioritas}
                  onChange={(e) => setEditPrioritas(e.target.value)}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 bg-white"
                >
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase">Deskripsi</label>
                <textarea
                  rows="3"
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 text-slate-700 bg-white resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-1/2 py-3 px-4 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}