"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Toast Component ───────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  
  const s = type === "success"
    ? { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" }
    : { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" };

  return (
    <div className="fixed top-5 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all"
      style={{ transform: "translateX(-50%)", background: s.bg, border: `1px solid ${s.border}`, color: s.color, minWidth: 280, maxWidth: "90vw" }}>
      <span className="flex-shrink-0">
        {type === "success" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        )}
      </span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
    </div>
  );
}

// ── Auth Headers ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("kayana_admin_token");
const authHeaders = (isFormData = false) => {
  const headers = { Accept: "application/json", Authorization: `Bearer ${getToken()}` };
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
};

// ── Main Content ──────────────────────────────────────────────────────────────
function KelolaHargaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlBrand = searchParams.get("brand") || "MOBILE LEGENDS";
  const urlPage = parseInt(searchParams.get("page")) || 1;

  const [brands] = useState([
    "MOBILE LEGENDS", "FREE FIRE", "PUBG MOBILE", "GENSHIN IMPACT","POINT BLANK","ARENA OF VALOR", "DELTA FORCE",
    "CALL OF DUTY MOBILE", "LORDS MOBILE", "STUMBLE GUYS", "FC MOBILE", "BLOOD STRIKE", "DRACONIA SAGA", "MAGIC CHESS",
    "HONOR OF KINGS", "VALORANT", "TELKOMSEL", "INDOSAT", "AXIS", "SMARTFREN", "TRI", "XL", "BY.U", "TOKEN PLN",
    "GOOGLE PLAY INDONESIA", "GARENA", "STEAM WALLET(IDR)", "SPOTIFY", "VIDIO", "WETV", "E-METERAI", "VIU"
  ]);

  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(urlPage);
  const itemsPerPage = 10;

  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku_code: "",
    manual_price: "",
    is_flash_sale: false,
    is_hidden: false,
    delete_poster: false,
    flash_start: "",
    flash_end: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  const [toast, setToast] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBrands = brands.filter(b => 
    b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchProducts = useCallback(async (brand) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://kayanamart.my.id/api/topup/products?brand=${encodeURIComponent(brand)}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]); // Aman dari crash kalau API error
      }
    } catch (error) {
      showToast("Gagal memuat produk dari server.", "error");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts(selectedBrand);
  }, [selectedBrand, fetchProducts]);

  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    setSelectedBrand(newBrand);
    setCurrentPage(1); 
    router.replace(`?brand=${encodeURIComponent(newBrand)}&page=1`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.replace(`?brand=${encodeURIComponent(selectedBrand)}&page=${newPage}`);
  };

  const handleEditClick = (item) => {
    setFormData({
      sku_code: item.buyer_sku_code,
      manual_price: item.is_manual_price ? item.price_sell : "",
      is_flash_sale: item.is_flash_sale || false,
      is_hidden: item.is_hidden || false,
      delete_poster: false,
      flash_start: item.flash_start ? item.flash_start.replace(' ', 'T').substring(0, 16) : "",
      flash_end: item.flash_end ? item.flash_end.replace(' ', 'T').substring(0, 16) : ""
    });
    setEditingProduct(item);
  };

  const handleUploadPoster = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    uploadData.append('sku_code', formData.sku_code);

    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/products/upload-poster", {
        method: "POST",
        headers: authHeaders(true),
        body: uploadData, 
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast("Poster Flash Sale berhasil diupload!");
        fetchProducts(selectedBrand); 
        setEditingProduct(prev => ({...prev, image_poster: data.data.image_poster}));
      } else {
        const errorDetail = data.errors ? JSON.stringify(data.errors) : data.message;
        showToast("Gagal upload: " + errorDetail, "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan saat mengupload gambar.", "error");
    }
    setIsUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedStart = formData.is_flash_sale && formData.flash_start ? formData.flash_start.replace('T', ' ') + ':00' : null;
      const formattedEnd = formData.is_flash_sale && formData.flash_end ? formData.flash_end.replace('T', ' ') + ':00' : null;

      const res = await fetch("https://kayanamart.my.id/api/admin/products/save", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          sku_code: formData.sku_code,
          manual_price: formData.manual_price ? parseInt(formData.manual_price) : null,
          is_flash_sale: formData.is_flash_sale,
          is_hidden: formData.is_hidden,
          delete_poster: formData.delete_poster,
          flash_start: formattedStart,
          flash_end: formattedEnd
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast("Pengaturan produk berhasil disimpan!");
        setEditingProduct(null);
        fetchProducts(selectedBrand); 
      } else {
        showToast("Gagal menyimpan: " + data.message, "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
    setIsSaving(false);
  };

  // 🔥 AIRBAG: Pastikan a.price itu number biar gak crash pas sorting
  const sortedProducts = [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Kelola Harga & Diskon</h2>
          <p className="text-xs text-slate-400 mt-0.5">Atur harga manual, flash sale, dan visibilitas produk.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500">Pilih Kategori:</label>

          {/* Custom Searchable Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 flex justify-between items-center transition"
            >
              <span className="truncate">{selectedBrand || "Pilih Kategori"}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-2 bg-slate-50 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Cari kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs font-medium bg-white rounded-lg px-3 py-2 outline-none border border-slate-200 focus:border-slate-400 transition"
                    autoFocus
                  />
                </div>

                <div className="max-h-[240px] overflow-y-auto">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          handleBrandChange({ target: { value: b } });
                          setIsDropdownOpen(false);
                          setSearchTerm(""); 
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedBrand === b
                            ? "bg-slate-900 text-white font-medium"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {b}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-xs text-slate-400 text-center">
                      Kategori tidak ditemukan
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
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
                  <tr className="text-xs text-slate-400 border-b border-slate-100 bg-white">
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Kode (SKU)</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Nama Produk</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Modal (Digiflazz)</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Harga Jual Web</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length === 0 ? (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-xs text-slate-400">Tidak ada produk untuk kategori ini.</td></tr>
                  ) : (
                    currentProducts.map((item) => (
                      <tr key={item.buyer_sku_code} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-600">{item.buyer_sku_code}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-medium text-slate-800 block">{item.product_name}</span>
                          {item.image_poster && (
                            <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-md font-medium border ${item.is_flash_sale ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {item.is_flash_sale ? 'Ada Poster' : 'Poster Tersimpan'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 tabular-nums">
                          {/* 🔥 AIRBAG: (item.price || 0) */}
                          Rp {(item.price || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`font-semibold tabular-nums text-xs ${item.is_manual_price ? 'text-amber-600' : 'text-slate-800'}`}>
                            {/* 🔥 AIRBAG: (item.price_sell || 0) */}
                            Rp {(item.price_sell || 0).toLocaleString("id-ID")}
                          </span>
                          {item.is_manual_price && <span className="ml-2 text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-medium">Manual</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          {item.is_flash_sale ? (
                            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg font-medium">Flash Sale</span>
                          ) : item.is_hidden ? (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded-lg font-medium">Disembunyikan</span>
                          ) : (
                            <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-2 py-1 rounded-lg font-medium">Normal</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button onClick={() => handleEditClick(item)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition font-medium">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Halaman <span className="font-medium text-slate-700">{currentPage}</span> dari <span className="font-medium text-slate-700">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
                  <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-800">Edit Produk</h3>
              <button onClick={() => setEditingProduct(null)} className="text-xl leading-none text-slate-400 hover:text-slate-600 transition">×</button>
            </div>
            
            <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-mono mb-1">SKU: {editingProduct.buyer_sku_code}</p>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{editingProduct.product_name}</p>
              {/* 🔥 AIRBAG */}
              <p className="text-xs text-slate-500 mt-1.5">Harga Modal: Rp {(editingProduct.price || 0).toLocaleString("id-ID")}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Harga Jual Manual (Rp)</label>
                <input type="number" value={formData.manual_price} onChange={(e) => setFormData({...formData, manual_price: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                  placeholder={`Margin Sistem: ${((editingProduct.price || 0) + 1000)}`} />
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => setFormData({...formData, manual_price: ""})} className="text-[10px] text-slate-500 hover:text-slate-800 font-medium transition">
                    Kembalikan ke Harga Margin Sistem
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white">
                <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition border-b border-slate-100">
                  <div className="flex items-center h-5 mt-0.5">
                    <input type="checkbox" checked={formData.is_flash_sale} onChange={(e) => setFormData({...formData, is_flash_sale: e.target.checked})} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Aktifkan Flash Sale</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tandai produk dengan label diskon di halaman pembeli.</p>
                  </div>
                </label>
                
                {formData.is_flash_sale && (
                  <div className="p-4 bg-slate-50/50 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Waktu Mulai (Opsional)</label>
                        <input 
                          type="datetime-local" 
                          value={formData.flash_start} 
                          onChange={(e) => setFormData({...formData, flash_start: e.target.value})} 
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400 transition" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-slate-500 mb-1 block">Waktu Selesai (Opsional)</label>
                        <input 
                          type="datetime-local" 
                          value={formData.flash_end} 
                          onChange={(e) => setFormData({...formData, flash_end: e.target.value})} 
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-slate-400 transition" 
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">Biarkan kosong jika diskon berlaku selamanya.</p>

                    <div className="pt-3 border-t border-slate-200/60">
                      <label className="text-[10px] font-medium text-slate-500 mb-1.5 block">Upload Poster (Opsional)</label>
                      <input type="file" onChange={handleUploadPoster} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-medium file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer transition" disabled={isUploading}/>
                      {isUploading && <p className="text-[10px] text-slate-500 mt-1.5 animate-pulse">Sedang mengupload...</p>}
                    </div>
                    
                    {editingProduct.image_poster && (
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={formData.delete_poster} onChange={(e) => setFormData({...formData, delete_poster: e.target.checked})} className="w-3.5 h-3.5 accent-orange-600 rounded" />
                        <span className="text-[10px] font-medium text-slate-600">Hapus poster saat menyimpan</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <div className="flex items-center h-5 mt-0.5">
                  <input type="checkbox" checked={formData.is_hidden} onChange={(e) => setFormData({...formData, is_hidden: e.target.checked})} className="w-4 h-4 accent-slate-600 rounded cursor-pointer" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Sembunyikan Produk</p>
                  <p className="text-xs text-slate-500 mt-0.5">Produk tidak akan ditampilkan di halaman pembeli.</p>
                </div>
              </label>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-full">Batal</button>
                <button type="submit" disabled={isSaving || isUploading} className="px-4 py-2.5 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium disabled:opacity-50 w-full">
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────────
export default function PageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="text-sm font-medium text-slate-400 animate-pulse">Menyiapkan Panel...</div>
      </div>
    }>
      <KelolaHargaContent />
    </Suspense>
  )
}