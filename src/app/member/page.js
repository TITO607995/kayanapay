"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk narik data dari Laravel pakai Token
  useEffect(() => {
    const fetchDashboardInfo = async () => {
      // Ambil token dari brankas browser
      const token = localStorage.getItem("kayana_token");
      
      // Kalau gak ada token, tendang ke halaman login
      if (!token) {
        router.push("/masuk");
        return;
      }

      try {
        const res = await fetch("http://192.168.1.9:8000/api/member/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Bawa tiket VIP nya ke Laravel
            "Accept": "application/json"
          }
        });

        const result = await res.json();

        if (result.status === "success") {
          setDashboardData(result.data);
        } else {
          // Kalau token expired atau gak valid, hapus dan suruh login lagi
          localStorage.removeItem("kayana_token");
          router.push("/masuk");
        }
      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardInfo();
  }, [router]);

  // Fungsi Logout
  const handleLogout = async () => {
    const token = localStorage.getItem("kayana_token");
    if (token) {
      try {
        await fetch("http://192.168.1.9:8000/api/member/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem("kayana_token");
    }
    router.push("/masuk");
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  // Tampilan loading tipis-tipis sebelum data masuk
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Memuat Markas Member...</p>
        </div>
      </div>
    );
  }

  // Kalau gagal load data, render kosong biar gak error
  if (!dashboardData) return null;

  const { profil, statistik, riwayat_terbaru } = dashboardData;

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-20">

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        
        {/* SECTION 1: PROFIL & KOIN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kartu Identitas */}
          {/* Kartu Identitas */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
            {/* Hiasan background lengkung di pojok kanan atas */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
            
            {/* Avatar / Inisial */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-400 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/30 flex-shrink-0">
              {profil.nama.charAt(0).toUpperCase()}
            </div>
            
            {/* Info Teks */}
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-black text-slate-800">{profil.nama}</h2>
              <p className="text-slate-500 font-medium mb-1">{profil.email} • {profil.whatsapp}</p>
              <div className="inline-block mt-2 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                Member sejak {profil.bergabung_sejak}
              </div>
            </div>

            {/* Tombol Logout */}
            <button 
              onClick={handleLogout} 
              className="mt-2 md:mt-0 flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold px-5 py-2.5 rounded-xl transition shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Keluar
            </button>
          </div>

          {/* Kartu Saldo / Kayana Koin */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-lg relative overflow-hidden text-white flex flex-col justify-center">
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🪙</div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Saldo Koin Anda</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🪙</span>
              <h3 className="text-4xl font-black text-amber-400 tracking-tight">
                {new Intl.NumberFormat("id-ID").format(profil.koin)}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-4">Gunakan koin untuk potongan harga di transaksi berikutnya.</p>
          </div>

        </div>

        {/* SECTION 2: KOTAK STATISTIK (DARI SCREENSHOT HIDDEN GAME) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Transaksi</p>
            <p className="text-2xl font-black text-slate-800">{statistik.total_transaksi}</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
            <p className="text-emerald-600 text-xs font-bold uppercase mb-1">Sukses</p>
            <p className="text-2xl font-black text-emerald-700">{statistik.sukses}</p>
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-center">
            <p className="text-amber-600 text-xs font-bold uppercase mb-1">Proses / Menunggu</p>
            <p className="text-2xl font-black text-amber-700">{statistik.proses + statistik.menunggu}</p>
          </div>
          <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center">
            <p className="text-red-600 text-xs font-bold uppercase mb-1">Gagal</p>
            <p className="text-2xl font-black text-red-700">{statistik.gagal}</p>
          </div>
        </div>

        {/* SECTION 3: TABEL RIWAYAT TRANSAKSI */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Riwayat Transaksi Terbaru</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-bold">Tanggal</th>
                  <th className="p-4 font-bold">No. Invoice</th>
                  <th className="p-4 font-bold">Produk</th>
                  <th className="p-4 font-bold">Target / ID</th>
                  <th className="p-4 font-bold">Total Harga</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {riwayat_terbaru.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">Belum ada riwayat transaksi. Yuk jajan dulu!</td>
                  </tr>
                ) : (
                  riwayat_terbaru.map((trx) => (
                    <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-600 whitespace-nowrap">
                        {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-slate-500">{trx.reference}</td>
                      <td className="p-4 font-bold text-slate-800">{trx.product_name}</td>
                      <td className="p-4 text-slate-600">{trx.target}</td>
                      <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{formatRupiah(trx.total_amount)}</td>
                      <td className="p-4 text-center">
                        {/* Logic Warna Status Label */}
                        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                          ${trx.status === 'SUKSES' ? 'bg-emerald-100 text-emerald-700' : 
                            trx.status === 'PENDING' || trx.status === 'UNPAID' ? 'bg-amber-100 text-amber-700' : 
                            'bg-red-100 text-red-700'}
                        `}>
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
    </main>
  );
}