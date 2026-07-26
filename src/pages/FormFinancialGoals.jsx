import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const BASE_URL = `${API_BASE_URL}/api/finance`

// Helper Formatting
const formatRupiah = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

// Sub-komponen Form Reusable untuk Tambah/Edit
function GoalForm({ values, onChange, onSubmit, submitLabel, isSubmitting, colorTheme = "blue" }) {
  const btnColor = colorTheme === "amber" ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700";
  const focusBorder = colorTheme === "amber" ? "focus:border-amber-500" : "focus:border-blue-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-[11px] font-bold text-slate-500 tracking-wider">
      <div>
        <label className="block mb-1.5 uppercase">Nama Goals *</label>
        <input
          type="text"
          required
          placeholder="Contoh: Tabungan Umroh / Beli Laptop"
          value={values.namaGoal}
          onChange={(e) => onChange('namaGoal', e.target.value)}
          className={`w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none ${focusBorder} text-slate-700 bg-white placeholder-slate-300`}
        />
      </div>

      <div>
        <label className="block mb-1.5 uppercase">Target Nominal *</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-normal text-slate-400">
            Rp
          </span>
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            value={values.targetNominal}
            onChange={(e) => onChange('targetNominal', e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none ${focusBorder} text-slate-700 bg-white`}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1.5 uppercase">Target Tanggal *</label>
        <input
          type="date"
          required
          value={values.targetTanggal}
          onChange={(e) => onChange('targetTanggal', e.target.value)}
          className={`w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none ${focusBorder} text-slate-700 bg-white`}
        />
      </div>

      <div>
        <label className="block mb-1.5 uppercase">Prioritas</label>
        <select
          value={values.prioritas}
          onChange={(e) => onChange('prioritas', e.target.value)}
          className={`w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none ${focusBorder} text-slate-700 bg-white`}
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
          placeholder="Rincian atau catatan tujuan..."
          value={values.deskripsi}
          onChange={(e) => onChange('deskripsi', e.target.value)}
          className={`w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none ${focusBorder} text-slate-700 bg-white placeholder-slate-300 resize-none`}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-50 ${btnColor}`}
        >
          {isSubmitting ? "Memproses..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function FormFinancialGoals() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const USER_ID = storedUser?.idUser;

  // State
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State (Tambah)
  const [formData, setFormData] = useState({
    namaGoal: '',
    targetNominal: '',
    targetTanggal: '',
    prioritas: 'Sedang',
    deskripsi: ''
  });

  // Modal & Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    namaGoal: '',
    targetNominal: '',
    targetTanggal: '',
    prioritas: 'Sedang',
    deskripsi: ''
  });

  // Fetch Goals Data
  const loadGoals = useCallback(async () => {
    if (!USER_ID) return;
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
  }, [USER_ID]);

  useEffect(() => {
    if (!USER_ID) {
      navigate('/');
      return;
    }
    loadGoals();
  }, [USER_ID, navigate, loadGoals]);

  // Handle Event 'Escape' key untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsEditOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Form State Handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit Handler (Create)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      idUser: USER_ID,
      namaGoal: formData.namaGoal,
      targetNominal: parseFloat(formData.targetNominal),
      targetTanggal: formData.targetTanggal,
      prioritas: formData.prioritas,
      deskripsi: formData.deskripsi,
    };

    try {
      const response = await fetch(`${BASE_URL}/save-financial-goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menyimpan ke database");

      alert("Goal berhasil disimpan!");
      setFormData({ namaGoal: '', targetNominal: '', targetTanggal: '', prioritas: 'Sedang', deskripsi: '' });
      loadGoals();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (goal) => {
    setEditGoalId(goal.idGoal);
    setEditFormData({
      namaGoal: goal.namaGoal || '',
      targetNominal: goal.targetNominal || '',
      targetTanggal: goal.targetTanggal || '',
      prioritas: goal.prioritas || 'Sedang',
      deskripsi: goal.deskripsi || ''
    });
    setIsEditOpen(true);
  };

  // Submit Handler (Update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      idGoal: editGoalId,
      idUser: USER_ID,
      namaGoal: editFormData.namaGoal,
      targetNominal: parseFloat(editFormData.targetNominal),
      targetTanggal: editFormData.targetTanggal,
      prioritas: editFormData.prioritas,
      deskripsi: editFormData.deskripsi,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (idGoal) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus goal ini?")) {
      try {
        const res = await fetch(`${BASE_URL}/delete-financial-goals?idGoal=${idGoal}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menghapus data");

        alert(data.message || "Goal berhasil dihapus");
        loadGoals();
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  // Filter Data
  const filteredGoals = goals.filter((goal) =>
    goal.namaGoal?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-slate-400 text-sm animate-pulse font-medium">Memuat target keuangan...</p>
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
                  <tr key={goal.idGoal} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 pr-4 font-bold text-slate-900 max-w-[140px] break-words">
                      {goal.namaGoal}
                    </td>
                    <td className="py-5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatRupiah(goal.targetNominal)}
                    </td>
                    <td className="py-5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(goal.targetTanggal)}
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
          <GoalForm
            values={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitLabel="Simpan Goals"
            isSubmitting={isSubmitting}
            colorTheme="blue"
          />
        </div>

      </div>

      {/* ================= DIALOG / MODAL UPDATE ================= */}
      {isEditOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setIsEditOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md p-8 rounded-2xl border border-slate-100 shadow-xl border-t-[3px] border-t-amber-500 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-amber-600 tracking-wide">Update Financial Goal</h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <GoalForm
              values={editFormData}
              onChange={handleEditFormChange}
              onSubmit={handleUpdate}
              submitLabel="Simpan Perubahan"
              isSubmitting={isSubmitting}
              colorTheme="amber"
            />
          </div>
        </div>
      )}
    </div>
  );
}