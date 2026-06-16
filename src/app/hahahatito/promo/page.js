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

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem("kayana_admin_token") : null;
const authHeaders = (json = true) => ({
  ...(json ? { "Content-Type": "application/json" } : {}),
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const emptyForm = { code: "", discount_amount: "", max_uses: "", valid_until: "", is_active: true };

export default function KelolaPromoPage() {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });
  const closeConfirm = () => setConfirm(null);

  const formatRupiah = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

  const fetchPromos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/promos", { headers: authHeaders(false) });
      const data = await res.json();
      if (data.status === "success") setPromos(data.data);
      else showToast("Gagal memuat promo: " + data.message, "error");
    } catch { showToast("Gagal terhubung ke server.", "error"); }
    setIsLoading(false);
  }, []);

  useEffect(() => { 
    fetchPromos(); 

    // 🔥 RADAR REVERB AMAN UNTUK NEXT.JS 🔥
    if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.channel('kayana-admin-channel')
            .listen('.promo.updated', () => {
                showToast("🔄 Menyinkronkan data promo...", "success");
                fetchPromos();
            });
    }

    return () => {
        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.leaveChannel('kayana-admin-channel');
        }
    };
  }, [fetchPromos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (p) => {
    setFormData({
      code: p.code,
      discount_amount: p.discount_amount,
      max_uses: p.max_uses,
      valid_until: p.valid_until ? p.valid_until.replace(" ", "T").substring(0, 16) : "",
      is_active: p.is_active === 1 || p.is_active === true,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => { setFormData(emptyForm); setIsEditing(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedDate = formData.valid_until ? formData.valid_until.replace("T", " ") + ":00" : null;
      const res = await fetch("https://kayanamart.my.id/api/admin/promos", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discount_amount: parseInt(formData.discount_amount),
          max_uses: parseInt(formData.max_uses || 0),
          valid_until: formattedDate,
          is_active: formData.is_active,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast(data.message || "Promo berhasil disimpan!");
        handleReset();
        // fetchPromos(); -> Biar Reverb yang bekerja
      } else {
        showToast("Gagal: " + (data.message || "Periksa kembali input."), "error");
      }
    } catch { showToast("Kesalahan jaringan.", "error"); }
    setIsSaving(false);
  };

  const handleDelete = (id, code) => {
    askConfirm(`Hapus kode promo "${code}"? Tindakan ini tidak bisa diundo.`, async () => {
      closeConfirm();
      try {
        const res = await fetch(`https://kayanamart.my.id/api/admin/promos/${id}`, {
          method: "DELETE", headers: authHeaders(false),
        });
        const data = await res.json();
        if (data.status === "success") { 
            showToast("Promo berhasil dihapus."); 
        } else {
            showToast("Gagal hapus: " + data.message, "error");
        }
      } catch { showToast("Kesalahan jaringan.", "error"); }
    });
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={closeConfirm} />}

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-1">
          {isEditing ? "Edit Kode Promo" : "Tambah Kode Promo"}
        </h2>
        <p className="text-xs text-slate-400 mb-5">Atur diskon, kuota pemakaian, dan batas waktu.</p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Kode Voucher</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange}
                placeholder="Misal: KAYANAJUARA" required disabled={isEditing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 uppercase font-semibold tracking-widest disabled:opacity-50" />
              {isEditing && <p className="text-[10px] text-slate-400 mt-1">Nama kode tidak bisa diubah saat edit.</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Potongan Harga (Rp)</label>
              <input type="number" name="discount_amount" value={formData.discount_amount} onChange={handleChange}
                placeholder="Misal: 5000" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Batas Kuota Pemakai</label>
              <input type="number" name="max_uses" value={formData.max_uses} onChange={handleChange}
                placeholder="0 = tidak terbatas"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Kedaluwarsa (Opsional)</label>
              <input type="datetime-local" name="valid_until" value={formData.valid_until} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
                className="w-4 h-4 accent-emerald-600 cursor-pointer" />
              <span className="text-sm text-slate-700">Aktifkan promo ini</span>
            </label>
            <div className="flex gap-2">
              {isEditing && (
                <button type="button" onClick={handleReset}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  Batal
                </button>
              )}
              <button type="submit" disabled={isSaving}
                className="px-5 py-2 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium disabled:opacity-50">
                {isSaving ? "Menyimpan..." : isEditing ? "Update Promo" : "Simpan Promo"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Daftar Kode Promo</h3>
          <button onClick={fetchPromos} className="text-xs text-slate-400 hover:text-slate-700 transition">🔄 Refresh</button>
        </div>

        {isLoading ? (
          <div className="p-10 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : promos.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">Belum ada kode promo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Kode</th>
                  <th className="px-5 py-3 font-medium">Potongan</th>
                  <th className="px-5 py-3 font-medium text-center">Kuota (Terpakai / Maks)</th>
                  <th className="px-5 py-3 font-medium">Kedaluwarsa</th>
                  <th className="px-5 py-3 font-medium text-center">Status</th>
                  <th className="px-5 py-3 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 tracking-widest">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs tabular-nums">
                      {formatRupiah(p.discount_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs">
                      <span className="font-semibold text-slate-800">{p.current_uses}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-slate-500">{p.max_uses === 0 ? "∞" : p.max_uses}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {p.valid_until ? new Date(p.valid_until).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Selamanya"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium border ${p.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => handleEdit(p)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(p.id, p.code)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition font-medium">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}