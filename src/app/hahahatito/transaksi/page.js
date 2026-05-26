"use client";

import { useState, useEffect } from "react";

export default function KelolaTransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 STATE UNTUK PAGINATION 🔥
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Jumlah transaksi per halaman

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.1.9:8000/api/admin/transactions");
      const data = await res.json();
      if (data.status === "success") {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleForceSuccess = async (reference) => {
    if (!confirm("Yakin mau paksa status transaksi ini jadi SUKSES? (Pastikan barang udah dikirim manual)")) return;
    
    try {
      const res = await fetch("http://192.168.1.9:8000/api/admin/transactions/force-success", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ reference })
      });
      const data = await res.json();
      alert(data.status === "success" ? "✅ Berhasil disukseskan manual!" : "❌ Gagal: " + data.message);
      fetchTransactions();
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleRetry = async (reference) => {
    if (!confirm("Yakin mau nembak ulang API Digiflazz untuk pesanan ini?")) return;
    
    try {
      const res = await fetch("http://192.168.1.9:8000/api/admin/transactions/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ reference })
      });
      const data = await res.json();
      alert(data.status === "success" ? `🔄 ${data.message}` : "❌ Gagal: " + data.message);
      fetchTransactions();
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "SUKSES") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "PENDING") return "bg-amber-100 text-amber-700 border-amber-200";
    if (status === "GAGAL") return "bg-red-100 text-red-700 border-red-200";
    if (status === "UNPAID") return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // 🔥 LOGIKA PEMOTONGAN DATA (PAGINATION) 🔥
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Transaksi 💸</h2>
          <p className="text-sm text-slate-500">Pantau pesanan masuk dan tangani transaksi yang nyangkut.</p>
        </div>
        <button onClick={fetchTransactions} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition">
          🔄 Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Memuat data transaksi dari server...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-bold">Waktu</th>
                    <th className="p-4 font-bold">Invoice / Ref</th>
                    <th className="p-4 font-bold">Target</th>
                    <th className="p-4 font-bold">Produk</th>
                    <th className="p-4 font-bold">Harga</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Tindakan Dewa ⚡</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentTransactions.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">Belum ada transaksi sama sekali Bro.</td></tr>
                  ) : (
                    currentTransactions.map((trx) => (
                      <tr key={trx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-4 text-xs text-slate-500">
                          {new Date(trx.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 font-mono font-bold text-blue-600 text-xs">{trx.reference}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{trx.target}</td>
                        <td className="p-4 font-bold text-slate-800">
                          {trx.product_name}
                          <br/><span className="text-[10px] font-normal text-slate-400">SKU: {trx.sku_code}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">Rp {trx.price.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-black tracking-wider border ${getStatusBadge(trx.status)}`}>
                            {trx.status}
                          </span>
                          {trx.note && <p className="text-[9px] text-slate-400 mt-1 max-w-[150px] truncate" title={trx.note}>{trx.note}</p>}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleRetry(trx.reference)}
                              disabled={trx.status === 'SUKSES'}
                              className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Tembak Ulang Digiflazz"
                            >
                              🔄 Retry
                            </button>
                            <button 
                              onClick={() => handleForceSuccess(trx.reference)}
                              disabled={trx.status === 'SUKSES'}
                              className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Paksa Berubah Jadi SUKSES"
                            >
                              ✅ Sukseskan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔥 KONTROL PAGINATION 🔥 */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <p className="text-sm text-slate-500 font-medium">
                  Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}