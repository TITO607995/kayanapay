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
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium">Ya, hapus</button>
        </div>
      </div>
    </div>
  );
}

const getToken = () => typeof window !== 'undefined' ? localStorage.getItem("kayana_admin_token") : null;

export default function KelolaBannerPage() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Form state
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [targetLink, setTargetLink] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const showToast = (message, type = "success") => setToast({ message, type });
  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });
  const closeConfirm = () => setConfirm(null);

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/banners", {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.status === "success") setBanners(data.data);
      else showToast("Gagal memuat banner.", "error");
    } catch { showToast("Gagal terhubung ke server.", "error"); }
    setIsLoading(false);
  }, []);

  useEffect(() => { 
    fetchBanners(); 

    // 🔥 RADAR REVERB AMAN UNTUK NEXT.JS 🔥
    if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.channel('kayana-public-channel')
            .listen('.banner.updated', () => {
                showToast("🔄 Menyinkronkan banner terbaru...", "success");
                fetchBanners();
            });
    }

    return () => {
        if (typeof window !== 'undefined' && window.Echo) {
            window.Echo.leaveChannel('kayana-public-channel');
        }
    };
  }, [fetchBanners]);

  // Preview gambar sebelum upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) { showToast("Pilih gambar dulu.", "error"); return; }
    setIsUploading(true);

    const fd = new FormData();
    fd.append("image", imageFile);
    fd.append("type", "banner");
    fd.append("target_link", targetLink);
    fd.append("sort_order", sortOrder ? parseInt(sortOrder) : 0);

    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/banners/upload", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Banner berhasil dipublish!");
        setImageFile(null);
        setPreview(null);
        setTargetLink("");
        setSortOrder("");
        e.target.reset();
        // fetchBanners(); -> Nggak usah dipanggil manual, Reverb yang narik
      } else {
        showToast("Gagal upload: " + (data.message || "Periksa ukuran file (max 2MB)."), "error");
      }
    } catch { showToast("Kesalahan jaringan.", "error"); }
    setIsUploading(false);
  };

  const handleDelete = (id) => {
    askConfirm("Hapus banner ini dari beranda? Banner akan langsung hilang dari web pembeli.", async () => {
      closeConfirm();
      try {
        const res = await fetch(`https://kayanamart.my.id/api/admin/banners/${id}`, {
          method: "DELETE",
          headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.status === "success") { 
            showToast("Banner berhasil dihapus."); 
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

      {/* Form upload */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Upload Banner Baru</h2>
        <p className="text-xs text-slate-400 mb-5">Rekomendasi: gambar landscape 1200×450px, max 2MB.</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Urutan tampil</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                placeholder="0 = paling awal (opsional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Link klik (opsional)</label>
              <input type="text" value={targetLink} onChange={e => setTargetLink(e.target.value)}
                placeholder="Contoh: /ml atau /ff"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">File gambar</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-2">
              <p className="text-xs font-medium text-slate-500 mb-2">Preview:</p>
              <img src={preview} alt="Preview banner" className="w-full max-w-lg rounded-xl border border-slate-200 object-cover aspect-[21/9]" />
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" disabled={isUploading || !imageFile}
              className="px-5 py-2.5 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {isUploading ? "Mengupload..." : "🚀 Publish Banner"}
            </button>
          </div>
        </form>
      </div>

      {/* List banner */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Banner Aktif</h3>
            <p className="text-xs text-slate-400 mt-0.5">Urut dari yang paling awal tampil</p>
          </div>
          <button onClick={fetchBanners} className="text-xs text-slate-400 hover:text-slate-700 transition">🔄 Refresh</button>
        </div>

        {isLoading ? (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="aspect-[21/9] bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs text-slate-400">Belum ada banner aktif. Web beranda tampak kosong!</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((bn, idx) => (
              <div key={bn.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="relative">
                  <img
                    src={`https://kayanamart.my.id${bn.image_url}`}
                    alt="Banner"
                    className="w-full aspect-[21/9] object-cover bg-slate-100"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                    #{idx + 1}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Link: {bn.target_link
                        ? <span className="text-blue-600 font-medium">{bn.target_link}</span>
                        : <span className="italic text-slate-400">–</span>
                      }
                    </p>
                    <p className="text-[10px] text-slate-400">urutan: {bn.sort_order}</p>
                  </div>
                  <button onClick={() => handleDelete(bn.id)}
                    className="w-full text-xs py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition font-medium">
                    Hapus Banner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}