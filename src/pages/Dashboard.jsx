import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

function formatTanggal(isoDate) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "2-digit" });
}

function statusProgres(persentase) {
  return persentase >= 80 ? "Hampir Tercapai" : persentase >= 50 ? "Progres Baik" : "Progres Stabil";
}

function buildLineChartData(goals, riwayat) {
  if (!goals?.length || !riwayat?.length) return [];

  const sortedByGoal = {};
  goals.forEach((g) => {
    sortedByGoal[g.idGoal] = riwayat
      .filter((r) => r.idGoal === g.idGoal)
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  });

  const allDates = Array.from(new Set(riwayat.map((r) => r.tanggal))).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const cursors = {};
  const runningTotal = {};
  goals.forEach((g) => {
    cursors[g.idGoal] = 0;
    runningTotal[g.idGoal] = 0;
  });

  return allDates.map((tanggal) => {
    const point = { tanggal };
    goals.forEach((g) => {
      const txs = sortedByGoal[g.idGoal];
      while (
        cursors[g.idGoal] < txs.length &&
        txs[cursors[g.idGoal]].tanggal === tanggal
      ) {
        const tx = txs[cursors[g.idGoal]];
        const delta = tx.jenisTransaksi?.toLowerCase() === "tarik" ? -tx.nominal : tx.nominal;
        runningTotal[g.idGoal] += delta;
        cursors[g.idGoal] += 1;
      }
      point[`goal_${g.idGoal}`] = runningTotal[g.idGoal];
    });
    return point;
  });
}

function SummaryCard({ label, value, sub, accentColor }) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm p-5 border-l-4 border-solid" style={{ borderLeftColor: accentColor }}>
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function ProgressRow({ nama, persentase, barColor }) {
  const pct = Math.max(0, Math.min(100, persentase));
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-gray-800">{nama}</span>
        <span className="text-sm font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

function SisaTargetCard({ nama, sisa, terkumpul, target }) {
  return (
    <div className="border-l-4 border-solid border-amber-400 bg-amber-50/40 rounded-lg px-4 py-3 mb-3 last:mb-0 flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-800">{nama}</p>
        <p className="text-xs text-gray-400 mt-0.5">Terkumpul: {formatRupiah(terkumpul)}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-red-500">- {formatRupiah(sisa)}</p>
        <p className="text-xs text-gray-400 mt-0.5">Target: {formatRupiah(target)}</p>
      </div>
    </div>
  );
}

export default function DashboardAnalitik() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterGoal, setFilterGoal] = useState("all");

  useEffect(() => {
    // Baca ulang data user setiap kali halaman ini dibuka, agar tidak memakai data login sebelumnya
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const userId = storedUser?.idUser;

    // Jika belum login (tidak ada idUser tersimpan), alihkan ke halaman login
    if (!userId) {
      navigate("/");
      return;
    }

    let cancelled = false;
    async function loadData() {
      try {
        const res = await fetch(`http://localhost:8080/api/dashboard/summary?idUser=${userId}`);
        if (!res.ok) throw new Error("Gagal mengambil data dari server");
        const json = await res.json();
        if (!Array.isArray(json?.goals)) throw new Error("Data dari server tidak valid");
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = useMemo(() => {
    if (!data || !data.goals) return [];
    return data.goals.map((g) => ({
      name: g.namaGoal,
      value: g.totalTerkumpul > 0 ? Math.round(g.totalTerkumpul) : 0,
    }));
  }, [data]);

  const lineChartData = useMemo(() => {
    if (!data) return [];
    return buildLineChartData(data.goals, data.riwayatTabungan || []);
  }, [data]);

  const riwayatTerurut = useMemo(() => {
    if (!data) return [];
    return [...(data.riwayatTabungan || [])].sort(
      (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
    );
  }, [data]);

  const filteredRiwayat = useMemo(() => {
    if (filterGoal === "all") return riwayatTerurut;
    return riwayatTerurut.filter((r) => String(r.idGoal) === filterGoal);
  }, [riwayatTerurut, filterGoal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm animate-pulse">Memuat data dari server Spring Boot...</p>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard Analitik</h1>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Keseluruhan Tabungan</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatRupiah(data.totalTabunganKeseluruhan)}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          <SummaryCard
            label="Goals Aktif Berjalan"
            value={`${data.totalGoalsAktif} Target`}
            sub={data.goals.map((g) => g.namaGoal).join(" & ") || "Tidak ada goal aktif"}
            accentColor="#3B82F6"
          />
          <SummaryCard
            label="Total Tabungan Terkumpul"
            value={formatRupiah(data.totalTabunganTerkumpul)}
            sub="Akumulasi saldo saat ini"
            accentColor="#10B981"
          />
          <SummaryCard
            label="Total Sisa Semua Goals"
            value={formatRupiah(data.totalSisaSemuaGoals)}
            sub="Akumulasi kekurangan dana"
            accentColor="#EF4444"
          />
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Capaian Target */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Capaian Target Setiap Goals</h2>
            {data.goals.map((g, i) => (
              <ProgressRow
                key={g.idGoal}
                nama={g.namaGoal}
                persentase={g.persentase}
                barColor={COLORS[i % COLORS.length]}
              />
            ))}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Alokasi Dana Terkumpul</h2>
            <div className="flex-1 flex items-center justify-center">
              <PieChart width={180} height={180}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatRupiah(v)} />
              </PieChart>
            </div>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{p.name}: <span className="font-semibold">{formatRupiah(p.value)}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Sisa Target */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Kekurangan Dana Per Goal</h2>
            {data.goals.map((g) => (
              <SisaTargetCard
                key={g.idGoal}
                nama={g.namaGoal}
                sisa={g.sisaTarget}
                terkumpul={g.totalTerkumpul}
                target={g.targetNominal}
              />
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Progres Tabungan Pemenuhan Goals</h2>
          <div className="bg-gray-50 rounded-lg p-3" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="tanggal" tickFormatter={formatTanggal} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                <YAxis tickFormatter={(v) => formatRupiah(v)} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  labelFormatter={formatTanggal}
                  formatter={(value, name) => {
                    const goal = data.goals.find((g) => `goal_${g.idGoal}` === name);
                    return [formatRupiah(value), goal ? goal.namaGoal : name];
                  }}
                />
                {data.goals.map((g, i) => (
                  <Line key={g.idGoal} type="monotone" dataKey={`goal_${g.idGoal}`} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Tabel Ringkasan Tabungan</h2>
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">Semua Goals</option>
              {data.goals.map((g) => (
                <option key={g.idGoal} value={String(g.idGoal)}>{g.namaGoal}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 py-2.5 rounded-l-md">Tanggal</th>
                  <th className="px-4 py-2.5">Goals</th>
                  <th className="px-4 py-2.5">Jenis</th>
                  <th className="px-4 py-2.5 rounded-r-md">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiwayat.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">Belum ada transaksi.</td>
                  </tr>
                ) : (
                  filteredRiwayat.map((r) => (
                    <tr key={r.idTabungan} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-gray-500">{formatTanggal(r.tanggal)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.namaGoal}</td>
                      <td className={`px-4 py-3 font-medium ${r.jenisTransaksi?.toLowerCase() === "tarik" ? "text-red-500" : "text-emerald-600"}`}>
                        {r.jenisTransaksi?.toLowerCase() === "tarik" ? "Tarik" : "Setor"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatRupiah(r.nominal)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}