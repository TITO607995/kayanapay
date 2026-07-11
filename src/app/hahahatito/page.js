"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("kayana_admin_token");
        const res = await fetch("https://kayanamart.my.id/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await res.json();
        if (data.status === "success") setStats(data.data);
        else setError(true);
      } catch {
        setError(true);
      }
      setIsLoading(false);
    };
    fetchStats();
  }, []);

  const formatRupiah = (n) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

  const statusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === "SUKSES")  return "bg-blue-50 text-blue-700 border-emerald-200";
    if (s === "PENDING" || s === "UNPAID") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "GAGAL")   return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  // ── Metric card ───────────────────────────────────────────────────────────
  const MetricCard = ({ label, value, sub, subColor = "text-slate-400" }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 tabular-nums">{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${subColor}`}>{sub}</p>}
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !stats) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 text-center">
        <p className="text-sm text-red-500 font-medium">Gagal memuat data dari server.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Selamat datang, Tito 👋</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Omset hari ini"
          value={formatRupiah(stats.hari_ini.omset)}
          sub={`${stats.hari_ini.sukses} transaksi sukses`}
          subColor="text-blue-600"
        />
        <MetricCard
          label="Transaksi hari ini"
          value={`${stats.hari_ini.transaksi} trx`}
          sub="Semua status"
        />
        <MetricCard
          label="Omset bulan ini"
          value={formatRupiah(stats.bulan_ini.omset)}
          sub="Bulan berjalan"
        />
        <MetricCard
          label="Total transaksi"
          value={stats.global.semua}
          sub={`${stats.global.sukses} sukses · ${stats.global.gagal} gagal`}
        />
      </div>

      {/* Tabel transaksi terbaru */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Transaksi terbaru</h3>
          <Link
            href="/hahahatito/transaksi"
            className="text-xs text-slate-400 hover:text-slate-700 transition"
          >
            Lihat semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Waktu</th>
                <th className="px-5 py-3 font-medium">Referensi</th>
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium text-right">Nominal</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.terbaru.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-xs">
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                stats.terbaru.map((trx) => (
                  <tr key={trx.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(trx.created_at).toLocaleString("id-ID", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-blue-600 whitespace-nowrap">
                      {trx.reference}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {trx.product_name}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                      {formatRupiah(trx.total_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${statusStyle(trx.status)}`}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}