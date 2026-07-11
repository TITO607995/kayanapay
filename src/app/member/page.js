"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk narik data dari Laravel pakai Token
  useEffect(() => {
    const fetchDashboardInfo = async () => {
      const token = localStorage.getItem("kayana_token");
      
      if (!token) {
        router.push("/masuk");
        return;
      }

      try {
        const res = await fetch("https://kayanamart.my.id/api/member/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        const result = await res.json();

        if (result.status === "success") {
          setDashboardData(result.data);
        } else {
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
        await fetch("https://kayanamart.my.id/api/member/logout", {
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

  // Redesigned: Premium Soft Status Badges
  const getStatusStyle = (status) => {
    if (status === 'SUKSES') return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20';
    if (status === 'PENDING' || status === 'UNPAID') return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
    return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-[13px] font-medium text-slate-500 tracking-wide animate-pulse">Memuat data member...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { profil, statistik, riwayat_terbaru } = dashboardData;

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans pb-24 selection:bg-slate-200 selection:text-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-8">
        
        {/* SECTION 1: PROFIL & KOIN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="md:col-span-2 bg-white rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            <div className="w-20 h-20 bg-slate-50 text-slate-700 rounded-full flex items-center justify-center text-2xl font-semibold ring-1 ring-inset ring-slate-200/50 flex-shrink-0">
              {profil.nama.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-1.5">
              <h2 className="text-xl font-semibold text-slate-900">{profil.nama}</h2>
              <div className="pt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-500 text-[12px] font-medium ring-1 ring-inset ring-slate-200/50">
                  Member sejak {profil.bergabung_sejak}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="mt-4 md:mt-0 flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-rose-600 bg-transparent hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>

          {/* Coin Balance Card (Premium Fintech Style) */}
          <div className="bg-slate-900 rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden flex flex-col justify-center">
            {/* Subtle light effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
            
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Saldo Koin</p>
            <div className="flex items-start gap-1">
              <h3 className="text-4xl font-semibold text-white tracking-tight">
                {new Intl.NumberFormat("id-ID").format(profil.koin)}
              </h3>
            </div>
            <p className="text-[12px] text-slate-400 mt-4 leading-relaxed">
              Dapat digunakan sebagai potongan harga transaksi Anda.
            </p>
          </div>
        </div>

        {/* SECTION 2: KOTAK STATISTIK */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-center gap-2">
            <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Total Transaksi</p>
            <p className="text-2xl font-semibold text-slate-900">{statistik.total_transaksi}</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Sukses</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{statistik.sukses}</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Diproses</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{statistik.proses + statistik.menunggu}</p>
          </div>
          <div className="bg-white p-6 rounded-[20px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Gagal</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{statistik.gagal}</p>
          </div>
        </div>

        {/* SECTION 3: RIWAYAT TRANSAKSI */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-semibold text-slate-900">Riwayat Transaksi</h3>
            <span className="text-[12px] font-medium bg-slate-50 text-slate-500 px-2.5 py-1 rounded-md ring-1 ring-inset ring-slate-200/50">
              {riwayat_terbaru.length} Data
            </span>
          </div>
          
          <div className="overflow-x-auto w-full">
            {riwayat_terbaru.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-inset ring-slate-100">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-[14px] text-slate-500">Belum ada riwayat transaksi.</p>
              </div>
            ) : (
              <>
                {/* TAMPILAN MOBILE (KARTU) */}
                <div className="block md:hidden p-4 space-y-3 bg-[#F8FAFC]/50">
                  {riwayat_terbaru.map((trx) => (
                    <div key={trx.id} className="bg-white p-5 rounded-[16px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-medium text-slate-900 text-[14px] leading-snug mb-1">{trx.product_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{trx.reference}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide shrink-0 ${getStatusStyle(trx.status)}`}>
                          {trx.status}
                        </span>
                      </div>
                      
                      <div className="h-px w-full bg-slate-50"></div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Target / Tujuan</p>
                          <p className="text-[13px] font-medium text-slate-700">{trx.target}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 text-[15px]">{formatRupiah(trx.total_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TAMPILAN LAPTOP (TABEL ELEGANT) */}
                <div className="hidden md:block w-full">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">No. Invoice</th>
                        <th className="px-6 py-4">Produk</th>
                        <th className="px-6 py-4">Target / ID</th>
                        <th className="px-6 py-4 text-right">Total Harga</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px]">
                      {riwayat_terbaru.map((trx) => (
                        <tr key={trx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500">{trx.reference}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{trx.product_name}</td>
                          <td className="px-6 py-4 text-slate-600">{trx.target}</td>
                          <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap text-right">{formatRupiah(trx.total_amount)}</td>
                          <td className="px-6 py-4 flex justify-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${getStatusStyle(trx.status)}`}>
                              {trx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}