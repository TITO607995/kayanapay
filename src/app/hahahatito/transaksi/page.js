"use client";

import { useState, useEffect, useCallback } from "react";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const s = type === "success"
    ? { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", icon: "✅" }
    : { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: "❌" };
  return (
    <div className="fixed top-5 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{ transform: "translateX(-50%)", background: s.bg, border: `1px solid ${s.border}`, color: s.color, minWidth: 280, maxWidth: "90vw" }}>
      <span className="text-lg flex-shrink-0">{s.icon}</span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-slate-200 shadow-xl">
        <p className="text-sm text-slate-700 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium">Ya, lanjutkan</button>
        </div>
      </div>
    </div>
  );
}

// ── Status badge style ────────────────────────────────────────────────────────
const statusStyle = (s) => {
  const u = s?.toUpperCase();
  if (u === "SUKSES")  return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (u === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200";
  if (u === "GAGAL")   return "bg-red-50 text-red-700 border-red-200";
  if (u === "UNPAID")  return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const getToken = () => localStorage.getItem("kayana_admin_token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─────────────────────────────────────────────────────────────────────────────
export default function KelolaTransaksiPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  // Filter
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });
  const closeConfirm = () => setConfirm(null);

  // ── Fetch semua transaksi (tanpa limit) ──────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/transactions?limit=9999", {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.status === "success") setTransactions(data.data);
      else showToast("Gagal memuat data: " + data.message, "error");
    } catch {
      showToast("Gagal terhubung ke server.", "error");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ── Filter + search ──────────────────────────────────────────────────────
  const filtered = transactions.filter((trx) => {
    if (filterStatus !== "ALL" && trx.status !== filterStatus) return false;
    if (filterTanggal && !trx.created_at.startsWith(filterTanggal)) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const haystack = `${trx.reference} ${trx.customer_whatsapp} ${trx.target} ${trx.product_name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilter = () => { setFilterStatus("ALL"); setFilterTanggal(""); setFilterSearch(""); setCurrentPage(1); };

  // ── Actions ──────────────────────────────────────────────────────────────
  const doPost = async (endpoint, reference, successMsg) => {
    try {
      const res = await fetch(`https://kayanamart.my.id/api/admin/transactions/${endpoint}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.status === "success") { showToast(successMsg); fetchTransactions(); }
      else showToast("Gagal: " + data.message, "error");
    } catch { showToast("Kesalahan jaringan.", "error"); }
  };

  const handleRetry        = (ref) => askConfirm("Retry Digiflazz? Saldo akan terpotong.", () => { closeConfirm(); doPost("retry", ref, "Retry berhasil dikirim ke Digiflazz."); });
  const handleForceSuccess = (ref) => askConfirm("Paksa status jadi SUKSES secara manual?", () => { closeConfirm(); doPost("force-success", ref, "Transaksi berhasil disukseskan."); });
  const handleCancel       = (ref) => askConfirm("Gagalkan transaksi ini? Jangan lupa info refund ke pembeli!", () => { closeConfirm(); doPost("cancel", ref, "Transaksi berhasil digagalkan."); });

  const handleExport = () => {
    let url = "https://kayanamart.my.id/api/admin/transactions/export?";
    if (filterStatus !== "ALL") url += `status=${filterStatus}&`;
    if (filterTanggal) url += `tanggal=${filterTanggal}`;
    window.open(url, "_blank");
  };

  const openWhatsApp = (phone, reference, productName) => {
    if (!phone) { showToast("Nomor WA tidak ada di database.", "error"); return; }
    const fmt = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const msg = `Halo Kak! Ini dari admin KayanaPay. Mau konfirmasi pesanan *${productName}* dengan nomor tagihan *${reference}*. Mohon maaf ada kendala, kami akan segera proses. Terima kasih 🙏`;
    window.open(`https://wa.me/${fmt}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const formatRupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={closeConfirm} />}

      {/* Header + filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Kelola Transaksi</h2>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} transaksi ditemukan</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchTransactions} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              🔄 Refresh
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium">
              ⬇️ Export Excel
            </button>
          </div>
        </div>

        {/* Filter baris */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Cari (Ref / WA / Target)</label>
            <input type="text" value={filterSearch} onChange={e => { setFilterSearch(e.target.value); setCurrentPage(1); }}
              placeholder="KP-123... / 0812..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400 transition" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Status</label>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400">
              <option value="ALL">Semua</option>
              <option value="SUKSES">SUKSES</option>
              <option value="PENDING">PENDING</option>
              <option value="GAGAL">GAGAL</option>
              <option value="UNPAID">UNPAID</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 block mb-1">Tanggal</label>
            <input type="date" value={filterTanggal} onChange={e => { setFilterTanggal(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-slate-400" />
          </div>
          <div className="flex items-end">
            <button onClick={resetFilter} className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Waktu</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Referensi</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Target</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap">Produk</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap text-right">Nominal</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Status</th>
                    <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center text-xs text-slate-400">
                        Tidak ada transaksi yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : paginated.map((trx) => (
                    <tr key={trx.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(trx.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-emerald-600 font-semibold block">{trx.reference}</span>
                        {trx.customer_whatsapp && (
                          <button onClick={() => openWhatsApp(trx.customer_whatsapp, trx.reference, trx.product_name)}
                            className="mt-1 text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-lg hover:bg-green-100 transition">
                            💬 {trx.customer_whatsapp}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">{trx.target}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-700 block">{trx.product_name}</span>
                        <span className="text-[10px] text-slate-400">SKU: {trx.sku_code}</span>
                        {trx.note && <span className="text-[10px] text-slate-400 block truncate max-w-[160px]" title={trx.note}>{trx.note}</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800 whitespace-nowrap text-xs">
                        {formatRupiah(trx.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-1 rounded-lg font-medium border ${statusStyle(trx.status)}`}>
                          {trx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1.5 flex-col w-32 mx-auto">
                          <button onClick={() => handleRetry(trx.reference)}
                            disabled={["SUKSES","GAGAL","UNPAID"].includes(trx.status)}
                            className="text-[10px] px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                            🔄 Retry Digiflazz
                          </button>
                          <div className="flex gap-1">
                            <button onClick={() => handleForceSuccess(trx.reference)}
                              disabled={trx.status === "SUKSES"}
                              className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                              ✅ Sukses
                            </button>
                            <button onClick={() => handleCancel(trx.reference)}
                              disabled={["SUKSES","GAGAL"].includes(trx.status)}
                              className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed font-medium">
                              ❌ Gagal
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Halaman <span className="font-medium text-slate-700">{currentPage}</span> dari <span className="font-medium text-slate-700">{totalPages}</span>
                  {" "}· {filtered.length} total
                </p>
                <div className="flex gap-1.5">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    ← Prev
                  </button>
                  {/* Page numbers - max 5 tampil */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) p = i + 1;
                      else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                      else p = currentPage - 2 + i;
                    }
                    return (
                      <button key={p} onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1.5 text-xs rounded-xl border transition ${currentPage === p ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
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