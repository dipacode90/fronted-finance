import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Ambil Base URL dari Environment Variable (Create React App)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const TABUNGAN_API_URL = `${API_BASE_URL}/api/tabungan`;

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

// Helper mendapatkan tanggal hari ini format YYYY-MM-DD waktu lokal (untuk min date)
const todayString = new Date().toLocaleDateString('en-CA');

// Helper format angka ribuan (contoh: 100000 -> "100.000")
const formatThousand = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const numericString = val.toString().replace(/\D/g, '');
  if (!numericString) return '';
  return parseInt(numericString, 10).toLocaleString('id-ID');
};

// Helper parse string berformat ribuan ke angka murni (contoh: "100.000" -> 100000)
const parseRawNumber = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/\D/g, '')) || 0;
};

export default function TabunganPage() {
  const navigate = useNavigate();

  // ID User diambil dari data akun yang sedang login
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const USER_ID = storedUser?.idUser;

  // State untuk data dari database
  const [transactions, setTransactions] = useState([]);
  const [goalsList, setGoalsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Form Input
  const [pilihanGoal, setPilihanGoal] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState('Setor');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // State Filter Pencarian
  const [searchGoal, setSearchGoal] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  // State Paging Tabel
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  // State Dialog Update Tabungan
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    idTabungan: null,
    idGoal: '',
    tanggal: '',
    jenisTransaksi: 'Setor',
    nominal: '',
    keterangan: '',
  });

  // 1. FETCH DATA KETIKA HALAMAN DIMUAT
  const loadData = async () => {
    try {
      setLoading(true);

      const resSummary = await fetch(`${API_BASE_URL}/api/dashboard/summary?idUser=${USER_ID}`);
      const dataSummary = await resSummary.json();
      setTransactions(Array.isArray(dataSummary?.riwayatTabungan) ? dataSummary.riwayatTabungan : []);

      const resGoals = await fetch(`${TABUNGAN_API_URL}/goals-list?idUser=${USER_ID}`);
      const dataGoals = await resGoals.json();
      const goals = Array.isArray(dataGoals) ? dataGoals : [];
      setGoalsList(goals);

      if (goals.length > 0 && !pilihanGoal) {
        setPilihanGoal(goals[0].idGoal);
      }
    } catch (error) {
      console.error("Gagal memuat data dari database:", error);
      setTransactions([]);
      setGoalsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!USER_ID) {
      navigate('/');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. HANDLE KETIKA FORM DISUBMIT (POST KE BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawNominal = parseRawNumber(nominal);

    if (!pilihanGoal || !tanggal || rawNominal <= 0) {
      alert("Mohon lengkapi semua kolom dengan nominal yang valid!");
      return;
    }

    const payload = {
      idGoal: parseInt(pilihanGoal),
      tanggal: tanggal,
      jenisTransaksi: jenisTransaksi,
      nominal: rawNominal,
      keterangan: keterangan,
    };

    try {
      const response = await fetch(`${TABUNGAN_API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menyimpan ke server");

      setTanggal('');
      setNominal('');
      setKeterangan('');
      setJenisTransaksi('Setor');
      
      alert("Transaksi tabungan berhasil disimpan!");
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // 3. BUKA & TUTUP DIALOG UPDATE
  const openEditDialog = (item) => {
    setEditForm({
      idTabungan: item.idTabungan,
      idGoal: item.idGoal ?? '',
      tanggal: item.tanggal ?? '',
      jenisTransaksi: item.jenisTransaksi ?? 'Setor',
      nominal: item.nominal ? formatThousand(item.nominal) : '',
      keterangan: item.keterangan ?? '',
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  // 4. HANDLE SUBMIT DIALOG UPDATE
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const rawNominal = parseRawNumber(editForm.nominal);

    if (!editForm.idGoal || !editForm.tanggal || rawNominal <= 0) {
      alert("Mohon lengkapi semua kolom dengan nominal yang valid!");
      return;
    }

    const payload = {
      idTabungan: editForm.idTabungan,
      idGoal: parseInt(editForm.idGoal),
      tanggal: editForm.tanggal,
      jenisTransaksi: editForm.jenisTransaksi,
      nominal: rawNominal,
      keterangan: editForm.keterangan,
    };

    try {
      const response = await fetch(`${TABUNGAN_API_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Gagal menyimpan perubahan ke server");

      alert("Perubahan tabungan berhasil disimpan!");
      closeEditDialog();
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // 5. FITUR HAPUS TABUNGAN
  const handleDelete = async (idTabungan) => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus transaksi tabungan ini?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${TABUNGAN_API_URL}/${idTabungan}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Gagal menghapus data dari server");

      alert("Transaksi tabungan berhasil dihapus!");
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Helper formatting rupiah
  function formatRupiah(value) {
    if (value === null || value === undefined || isNaN(value)) return "Rp 0";
    return "Rp " + Math.round(value).toLocaleString("id-ID");
  }

  // Filter data pencarian local
  const filteredTransactions = transactions.filter((t) => {
    const matchGoal = t.namaGoal?.toLowerCase().includes(searchGoal.toLowerCase());
    const matchDate = filterTanggal ? t.tanggal === filterTanggal : true;
    return matchGoal && matchDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchGoal, filterTanggal, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (safeCurrentPage - 1) * rowsPerPage,
    safeCurrentPage * rowsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm animate-pulse">Menghubungkan ke database...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Data Transaksi Tabungan</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* ================= BLOK KIRI: DAFTAR DATA & FILTER ================= */}
        <div className="xl:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          
          <div className="flex flex-wrap gap-4 mb-8">
            <input
              type="text"
              placeholder="Search by Goals..."
              value={searchGoal}
              onChange={(e) => setSearchGoal(e.target.value)}
              className="w-full max-w-xs px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white placeholder-slate-400 shadow-sm"
            />
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="w-full max-w-[200px] px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white text-slate-600 shadow-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-4 rounded-l-xl">Pilihan Goals</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Jenis Transaksi</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((item) => (
                  <tr key={item.idTabungan} className="text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-4 font-bold text-slate-900 max-w-[150px] break-words">
                      {item.namaGoal}
                    </td>
                    <td className="py-5 px-4 text-slate-500 whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.jenisTransaksi?.toLowerCase() === 'setor'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {item.jenisTransaksi?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="py-5 px-4 text-slate-400 max-w-[180px] break-words">
                      {item.keterangan || '-'}
                    </td>
                    <td className="py-5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.idTabungan)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Tidak ada riwayat transaksi ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Kontrol Paging */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>Tampilkan</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 bg-white"
              >
                {ROWS_PER_PAGE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span>baris</span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Halaman {safeCurrentPage} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BLOK KANAN: FORM ADD TABUNGAN ================= */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm border-t-[3px] border-t-emerald-500">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-lg">📋</span>
            <h3 className="text-base font-bold text-emerald-600 tracking-wide">Form Add Tabungan</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-[11px] font-bold text-slate-500 tracking-wider">
            <div>
              <label className="block mb-2 uppercase">Pilihan Goals</label>
              <select
                value={pilihanGoal}
                onChange={(e) => setPilihanGoal(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
              >
                {goalsList.length === 0 ? (
                  <option value="">-- Tidak ada Goal Aktif --</option>
                ) : (
                  goalsList.map((g) => (
                    <option key={g.idGoal} value={g.idGoal}>{g.namaGoal}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block mb-2 uppercase">Tanggal</label>
              <input
                type="date"
                required
                max={todayString} /* Mencegah tanggal setelah hari ini */
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 uppercase">Jenis Transaksi</label>
              <div className="flex items-center space-x-6 pt-1 font-semibold text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="jenis_transaksi"
                    value="Setor"
                    checked={jenisTransaksi === 'Setor'}
                    onChange={() => setJenisTransaksi('Setor')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>SETOR</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="jenis_transaksi"
                    value="Tarik"
                    checked={jenisTransaksi === 'Tarik'}
                    onChange={() => setJenisTransaksi('Tarik')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>TARIK</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 uppercase">Nominal</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-normal text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={nominal}
                  onChange={(e) => setNominal(formatThousand(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 uppercase">Keterangan</label>
              <textarea
                rows="3"
                placeholder="Catatan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white placeholder-slate-300 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Simpan Tabungan
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* ================= DIALOG UPDATE TABUNGAN ================= */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-emerald-600 tracking-wide">Update Tabungan</h3>
              <button
                type="button"
                onClick={closeEditDialog}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-5 text-[11px] font-bold text-slate-500 tracking-wider">
              <div>
                <label className="block mb-2 uppercase">Pilihan Goals</label>
                <select
                  value={editForm.idGoal}
                  onChange={(e) => setEditForm((f) => ({ ...f, idGoal: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
                >
                  {goalsList.length === 0 ? (
                    <option value="">-- Tidak ada Goal Aktif --</option>
                  ) : (
                    goalsList.map((g) => (
                      <option key={g.idGoal} value={g.idGoal}>{g.namaGoal}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-2 uppercase">Tanggal</label>
                <input
                  type="date"
                  required
                  max={todayString} /* Mencegah tanggal setelah hari ini */
                  value={editForm.tanggal}
                  onChange={(e) => setEditForm((f) => ({ ...f, tanggal: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block mb-2 uppercase">Jenis Transaksi</label>
                <div className="flex items-center space-x-6 pt-1 font-semibold text-xs text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit_jenis_transaksi"
                      value="Setor"
                      checked={editForm.jenisTransaksi === 'Setor'}
                      onChange={() => setEditForm((f) => ({ ...f, jenisTransaksi: 'Setor' }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>SETOR</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit_jenis_transaksi"
                      value="Tarik"
                      checked={editForm.jenisTransaksi === 'Tarik'}
                      onChange={() => setEditForm((f) => ({ ...f, jenisTransaksi: 'Tarik' }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>TARIK</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-2 uppercase">Nominal</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-normal text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="0"
                    value={editForm.nominal}
                    onChange={(e) => setEditForm((f) => ({ ...f, nominal: formatThousand(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 uppercase">Keterangan</label>
                <textarea
                  rows="3"
                  placeholder="Catatan..."
                  value={editForm.keterangan}
                  onChange={(e) => setEditForm((f) => ({ ...f, keterangan: e.target.value }))}
                  className="w-full px-4 py-2.5 font-normal text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-700 bg-white placeholder-slate-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditDialog}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-emerald-700 transition-colors shadow-sm"
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