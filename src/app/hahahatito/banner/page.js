"use client";

import { useState, useEffect } from "react";

export default function KelolaBannerPage() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk form upload banner
  const [imageFile, setImageFile] = useState(null);
  const [targetLink, setTargetLink] = useState("");
  const [type, setType] = useState("banner"); // Default type banner slider utama

  // 1. Ambil list banner dari Laravel
  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.1.9:8000/api/banners");
      const data = await res.json();
      if (data.status === "success") {
        setBanners(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat banner:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. Fungsi Kirim Gambar ke Laravel
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Pilih gambar bannernya dulu Bro!");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("type", type);
    formData.append("target_link", targetLink);

    try {
      const res = await fetch("http://192.168.1.9:8000/api/admin/banners/upload", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("✅ Banner sukses nangkring di web depan!");
        setImageFile(null);
        setTargetLink("");
        // Reset input file secara manual
        e.target.reset();
        fetchBanners(); // Refresh list banner
      } else {
        alert("❌ Gagal upload: " + (data.message || "Periksa ukuran file (max 2MB)"));
      }
    } catch (error) {
      alert("❌ Terjadi kesalahan jaringan.");
    }
    setIsUploading(false);
  };

  // 3. Fungsi Hapus Banner
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus banner ini dari beranda depan, Bro?")) return;

    try {
      const res = await fetch(`http://192.168.1.9:8000/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("🗑️ Banner berhasil didepak!");
        fetchBanners();
      }
    } catch (error) {
      alert("❌ Gagal menghapus banner.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION FORM UPLOAD */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Banner Promo Baru 🖼️</h2>
        <p className="text-sm text-slate-500 mb-6">Tambahkan gambar promo slider utama untuk halaman beranda pembeli.</p>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Pilih Gambar (Max 2MB)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Link Tujuan / URL Klik (Opsional)</label>
            <input 
              type="text" 
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              placeholder="Contoh: /ml atau /telkomsel"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-50 h-[42px]"
          >
            {isUploading ? "Memproses..." : "Publish Banner 🚀"}
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-2">* Rekomendasi ukuran banner memanjang berbentuk landscape (misal: 1200x450 pixel) biar proporsional.</p>
      </div>

      {/* SECTION LIST BANNER AKTIF */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Daftar Banner Aktif Saat Ini</h3>
        
        {isLoading ? (
          <div className="p-6 text-center text-slate-400 animate-pulse font-bold">Memuat database gambar...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Belum ada banner aktif. Web depan bakal kosongan Bro!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((bn) => (
              <div key={bn.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 relative group shadow-sm">
                <img 
                  src={`http://192.168.1.9:8000${bn.image_url}`} 
                  alt="Kayana Banner" 
                  className="w-full aspect-[21/9] object-cover"
                />
                <div className="p-4 flex items-center justify-between bg-white border-t border-slate-100">
                  <div className="truncate pr-4">
                    <p className="text-xs font-bold text-slate-700 truncate">Link: {bn.target_link || "Tidak ada (Gambar mati)"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ID: {bn.id}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(bn.id)}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition flex-shrink-0"
                  >
                    Hapus 🗑️
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