import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const PREDIKSI_API_URL = `${API_BASE_URL}/api/prediksi`;

const ALPHA_OPTIONS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const rounded = Math.round(value);
  return (rounded < 0 ? '-Rp ' : 'Rp ') + Math.abs(rounded).toLocaleString('id-ID');
}

function formatAngka(value, digits = 2) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: digits });
}

function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' });
}

const STATUS_STYLE = {
  'Tercapai': 'bg-emerald-50 text-emerald-600',
  'On Track': 'bg-blue-50 text-blue-600',
  'Terlambat': 'bg-amber-50 text-amber-600',
  'Tidak Tercapai': 'bg-rose-50 text-rose-600',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[status] || 'bg-slate-100 text-slate-500'}`}>
      {status || '-'}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-800 break-words">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function PrediksiPage() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const USER_ID = storedUser?.idUser;

  const [periode, setPeriode] = useState('bulanan');
  const [alphaMode, setAlphaMode] = useState('auto');
  const [selectedGoal, setSelectedGoal] = useState('');

  const [ringkasan, setRingkasan] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loadingRingkasan, setLoadingRingkasan] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');

  const satuan = periode === 'mingguan' ? 'minggu' : 'bulan';

  // 1. Ringkasan prediksi semua goal
  useEffect(() => {
    if (!USER_ID) {
      navigate('/');
      return;
    }
    const loadRingkasan = async () => {
      try {
        setLoadingRingkasan(true);
        const res = await fetch(`${PREDIKSI_API_URL}/ringkasan?idUser=${USER_ID}&periode=${periode}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRingkasan(list);
        setSelectedGoal((current) =>
          list.some((g) => String(g.idGoal) === String(current)) ? current : (list[0]?.idGoal ?? '')
        );
      } catch (error) {
        console.error('Gagal memuat ringkasan prediksi:', error);
        setRingkasan([]);
      } finally {
        setLoadingRingkasan(false);
      }
    };
    loadRingkasan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode]);

  // 2. Detail perhitungan SES goal terpilih
  useEffect(() => {
    if (!selectedGoal) {
      setDetail(null);
      return;
    }
    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        setErrorDetail('');
        const res = await fetch(`${PREDIKSI_API_URL}/${selectedGoal}?periode=${periode}&alpha=${alphaMode}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghitung prediksi');
        setDetail(data);
      } catch (error) {
        setDetail(null);
        setErrorDetail(error.message);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [selectedGoal, periode, alphaMode]);

  // Data grafik: aktual vs ramalan, ditambah titik ramalan periode berikutnya
  const chartData = detail?.langkah
    ? [
        ...detail.langkah.map((l) => ({ label: l.label, aktual: l.aktual, ramalan: l.ramalan })),
        { label: `t = ${detail.langkah.length + 1} (prediksi)`, aktual: null, ramalan: detail.ramalanBerikutnya },
      ]
    : [];

  const rencana = detail?.perencanaan;

  if (loadingRingkasan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm animate-pulse">Menghitung prediksi tabungan...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Prediksi Tabungan</h2>
          <p className="text-sm text-slate-400 mt-1">Metode Single Exponential Smoothing (SES)</p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white text-slate-700 shadow-sm"
          >
            <option value="bulanan">Periode Bulanan</option>
            <option value="mingguan">Periode Mingguan</option>
          </select>
          <select
            value={alphaMode}
            onChange={(e) => setAlphaMode(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white text-slate-700 shadow-sm"
          >
            <option value="auto">α Otomatis (MAPE terkecil)</option>
            {ALPHA_OPTIONS.map((a) => (
              <option key={a} value={a}>α = {a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= RINGKASAN SEMUA GOAL ================= */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Perencanaan Financial Goals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">Goal</th>
                <th className="py-3.5 px-4">Sisa Target</th>
                <th className="py-3.5 px-4">Prediksi / {satuan}</th>
                <th className="py-3.5 px-4">Estimasi Tercapai</th>
                <th className="py-3.5 px-4">Target Tanggal</th>
                <th className="py-3.5 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ringkasan.map((g) => (
                <tr
                  key={g.idGoal}
                  onClick={() => setSelectedGoal(g.idGoal)}
                  className={`cursor-pointer transition-colors ${
                    String(g.idGoal) === String(selectedGoal) ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-4 px-4 font-bold text-slate-900">{g.namaGoal}</td>
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{formatRupiah(g.perencanaan?.sisaTarget)}</td>
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{formatRupiah(g.ramalanBerikutnya)}</td>
                  <td className="py-4 px-4 text-slate-600 whitespace-nowrap">{g.perencanaan?.estimasiLabel || '-'}</td>
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{formatTanggal(g.perencanaan?.targetTanggal)}</td>
                  <td className="py-4 px-4"><StatusBadge status={g.perencanaan?.status} /></td>
                </tr>
              ))}
              {ringkasan.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">Belum ada Financial Goal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= DETAIL GOAL TERPILIH ================= */}
      {ringkasan.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detail Perhitungan Goal</label>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white text-slate-700 shadow-sm"
          >
            {ringkasan.map((g) => (
              <option key={g.idGoal} value={g.idGoal}>{g.namaGoal}</option>
            ))}
          </select>
        </div>
      )}

      {loadingDetail && <p className="text-slate-400 text-sm animate-pulse">Menghitung...</p>}
      {errorDetail && <p className="px-4 py-3 rounded-xl bg-rose-50 text-rose-600 text-sm">{errorDetail}</p>}

      {detail && !loadingDetail && (
        <>
          {detail.pesan && (
            <p className="px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold">⚠️ {detail.pesan}</p>
          )}

          {/* Kartu hasil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Alpha (α) Digunakan"
              value={detail.alpha ?? '-'}
              sub={
                detail.modeAlpha === 'otomatis'
                  ? `Otomatis, ${detail.kriteriaAlpha} terkecil`
                  : detail.alpha !== undefined ? `Manual · α terbaik = ${detail.alphaTerbaik}` : ''
              }
            />
            <StatCard
              label={`Prediksi Tabungan ${satuan} Berikutnya`}
              value={formatRupiah(detail.ramalanBerikutnya)}
              sub={detail.mape !== undefined ? `MAPE ${formatAngka(detail.mape)}%` : ''}
            />
            <StatCard
              label="Estimasi Tercapai"
              value={rencana?.estimasiLabel || (rencana?.status === 'Tercapai' ? 'Sudah tercapai' : '-')}
              sub={rencana?.periodeDibutuhkan ? `± ${rencana.periodeDibutuhkan} ${satuan} lagi` : ''}
            />
            <StatCard
              label={`Rekomendasi / ${satuan}`}
              value={formatRupiah(rencana?.rekomendasiPerPeriode)}
              sub={`Agar tercapai sebelum ${formatTanggal(rencana?.targetTanggal)} (${rencana?.sisaPeriode ?? 0} ${satuan})`}
            />
          </div>

          {rencana && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
              <StatusBadge status={rencana.status} />
              <p className="text-sm text-slate-600">{rencana.keterangan}</p>
              <p className="text-sm text-slate-400 ml-auto">
                Terkumpul {formatRupiah(rencana.totalTerkumpul)} dari {formatRupiah(rencana.targetNominal)}
              </p>
            </div>
          )}

          {detail.langkah && (
            <>
              {/* Grafik aktual vs ramalan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Grafik Data Aktual vs Ramalan</h3>
                <div className="overflow-x-auto">
                  <div style={{ minWidth: Math.max(600, chartData.length * 70), height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                          dataKey="label"
                          interval={0}
                          tick={{ fontSize: 11, fill: '#9CA3AF' }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                          angle={-35}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tickFormatter={(v) => formatRupiah(v)} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={100} />
                        <Tooltip formatter={(value, name) => [formatRupiah(value), name]} />
                        <Legend verticalAlign="top" height={30} />
                        <Line type="monotone" dataKey="aktual" name="Aktual (Xt)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
                        <Line type="monotone" dataKey="ramalan" name="Ramalan (Ft)" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Tabel perhitungan SES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800">Tabel Perhitungan SES (α = {detail.alpha})</h3>
                <div className="mt-3 mb-5 px-4 py-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1 font-mono">
                  <p>F(1) = X(1)</p>
                  <p>F(t+1) = α · X(t) + (1 − α) · F(t)</p>
                  <p>e(t) = X(t) − F(t) &nbsp;·&nbsp; MAPE = Σ(|e| / X) / n × 100%</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3 px-3 rounded-l-xl">t</th>
                        <th className="py-3 px-3">Periode</th>
                        <th className="py-3 px-3 text-right">Aktual (Xt)</th>
                        <th className="py-3 px-3 text-right">Ramalan (Ft)</th>
                        <th className="py-3 px-3 text-right">Error (e)</th>
                        <th className="py-3 px-3 text-right">|e|</th>
                        <th className="py-3 px-3 text-right">e²</th>
                        <th className="py-3 px-3 text-right rounded-r-xl">|e|/X (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {detail.langkah.map((l) => (
                        <tr key={l.t}>
                          <td className="py-3 px-3">{l.t}</td>
                          <td className="py-3 px-3 whitespace-nowrap">{l.label}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(l.aktual)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(l.ramalan)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(l.error)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(l.absError)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatAngka(l.sqError, 0)}</td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">{formatAngka(l.pctError)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50/60 font-semibold text-blue-700">
                        <td className="py-3 px-3">{detail.langkah.length + 1}</td>
                        <td className="py-3 px-3 whitespace-nowrap">Prediksi</td>
                        <td className="py-3 px-3 text-right">-</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(detail.ramalanBerikutnya)}</td>
                        <td colSpan="4"></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="text-slate-700 font-bold border-t-2 border-slate-200">
                        <td colSpan="5" className="py-3 px-3 text-right">MAD / MSE / MAPE</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(detail.mad)}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">{formatAngka(detail.mse, 0)}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {detail.mape !== null ? `${formatAngka(detail.mape)}%` : '-'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Error dihitung mulai t = 2. Periode dengan aktual = 0 tidak diikutkan dalam MAPE (pembagian dengan nol).
                </p>
              </div>

              {/* Perbandingan alpha */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4">Perbandingan Nilai Alpha (α)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <th className="py-3 px-3 rounded-l-xl">α</th>
                        <th className="py-3 px-3 text-right">MAD</th>
                        <th className="py-3 px-3 text-right">MSE</th>
                        <th className="py-3 px-3 text-right">MAPE (%)</th>
                        <th className="py-3 px-3 text-right rounded-r-xl">Prediksi Berikutnya</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {detail.perbandingan.map((p) => {
                        const isBest = p.alpha === detail.alphaTerbaik;
                        return (
                          <tr key={p.alpha} className={isBest ? 'bg-emerald-50 font-semibold text-emerald-700' : ''}>
                            <td className="py-3 px-3 whitespace-nowrap">
                              {p.alpha} {isBest && <span className="ml-1 text-xs">★ terbaik</span>}
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(p.mad)}</td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">{formatAngka(p.mse, 0)}</td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">{formatAngka(p.mape)}</td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">{formatRupiah(p.ramalanBerikutnya)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
