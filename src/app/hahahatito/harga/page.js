"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Kita bungkus logic utamanya di dalam komponen terpisah biar Next.js gak rewel soal useSearchParams
function KelolaHargaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil state dari URL, kalau kosong pakai nilai default
  const urlBrand = searchParams.get("brand") || "MOBILE LEGENDS";
  const urlPage = parseInt(searchParams.get("page")) || 1;

  const [brands] = useState([
    "MOBILE LEGENDS", "FREE FIRE", "PUBG MOBILE", "VALORANT", "TELKOMSEL", "TOKEN PLN"
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
    delete_poster: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 

  const fetchProducts = async (brand) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://192.168.100.17:8000/api/topup/products?brand=${encodeURIComponent(brand)}`);
      const data = await res.json();
      if (data.status === "success") {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts(selectedBrand);
  }, [selectedBrand]);

  // 🔥 Fungsi ganti URL otomatis pas pindah Brand
  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    setSelectedBrand(newBrand);
    setCurrentPage(1); 
    router.replace(`?brand=${encodeURIComponent(newBrand)}&page=1`);
  };

  // 🔥 Fungsi ganti URL otomatis pas pindah Halaman
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.replace(`?brand=${encodeURIComponent(selectedBrand)}&page=${newPage}`);
  };

  const handleEditClick = (item) => {
    setFormData({
      sku_code: item.buyer_sku_code,
      manual_price: item.is_manual_price ? item.price_sell : "",
      is_flash_sale: item.is_flash_sale || false,
      is_hidden: false,
      delete_poster: false
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
      const res = await fetch("http://192.168.100.17:8000/api/admin/products/upload-poster", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: uploadData, 
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("✅ Poster Flash Sale berhasil diupload!");
        fetchProducts(selectedBrand); 
        setEditingProduct(prev => ({...prev, image_poster: data.data.image_poster}));
      } else {
        const errorDetail = data.errors ? JSON.stringify(data.errors) : data.message;
        alert("❌ Gagal upload: " + errorDetail);
      }
    } catch (error) {
      alert("❌ Terjadi kesalahan jaringan saat mengupload gambar.");
    }
    setIsUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("http://192.168.100.17:8000/api/admin/products/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          sku_code: formData.sku_code,
          manual_price: formData.manual_price ? parseInt(formData.manual_price) : null,
          is_flash_sale: formData.is_flash_sale,
          is_hidden: formData.is_hidden,
          delete_poster: formData.delete_poster
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setEditingProduct(null);
        fetchProducts(selectedBrand); 
      } else {
        alert("Gagal menyimpan: " + data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
    setIsSaving(false);
  };

  const sortedProducts = [...products].sort((a, b) => a.price - b.price);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kelola Harga & Diskon</h2>
          <p className="text-sm text-slate-500">Atur harga manual, flash sale, dan sembunyikan produk.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600">Pilih Kategori:</label>
          <select value={selectedBrand} onChange={handleBrandChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200">
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Menarik data dari server...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-bold">Kode (SKU)</th>
                    <th className="p-4 font-bold">Nama Produk</th>
                    <th className="p-4 font-bold">Modal (Digiflazz)</th>
                    <th className="p-4 font-bold">Harga Jual Web</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {currentProducts.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">Tidak ada produk untuk brand ini.</td></tr>
                  ) : (
                    currentProducts.map((item) => (
                      <tr key={item.buyer_sku_code} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold text-blue-600 text-xs">{item.buyer_sku_code}</td>
                        <td className="p-4 font-bold text-slate-800">
                          {item.product_name}
                          {item.image_poster && (
                            <span className={`ml-2 text-[9px] px-2 py-0.5 rounded font-bold ${item.is_flash_sale ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                              {item.is_flash_sale ? 'Ada Poster' : 'Poster Disimpan'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500">Rp {item.price.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                          <span className={`font-black ${item.is_manual_price ? 'text-amber-500' : 'text-emerald-600'}`}>
                            Rp {item.price_sell.toLocaleString("id-ID")}
                          </span>
                          {item.is_manual_price && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold">MANUAL</span>}
                        </td>
                        <td className="p-4">
                          {item.is_flash_sale ? (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-red-200">🔥 Flash Sale</span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Normal</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleEditClick(item)} className="bg-slate-800 hover:bg-blue-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <p className="text-sm text-slate-500 font-medium">Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span></p>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">← Prev</button>
                  <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-down max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">Edit Produk</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-red-500 font-black text-xl">×</button>
            </div>
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold mb-1">SKU: {editingProduct.buyer_sku_code}</p>
              <p className="font-bold text-slate-800 leading-tight">{editingProduct.product_name}</p>
              <p className="text-sm text-emerald-600 font-bold mt-2">Modal: Rp {editingProduct.price.toLocaleString("id-ID")}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">Override Harga Manual (Rp)</label>
                <input type="number" value={formData.manual_price} onChange={(e) => setFormData({...formData, manual_price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder={`Sistem Margin: ${(editingProduct.price + 1000)}`} />
                <div className="mt-2">
                  <button type="button" onClick={() => setFormData({...formData, manual_price: ""})} className="text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition">🔄 Kembalikan ke Harga Margin Sistem</button>
                </div>
              </div>

              <div className="border border-red-100 bg-red-50/50 rounded-xl overflow-hidden transition-all">
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-red-50 transition">
                  <input type="checkbox" checked={formData.is_flash_sale} onChange={(e) => setFormData({...formData, is_flash_sale: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer" />
                  <div>
                    <p className="font-bold text-red-700 text-sm">Aktifkan Flash Sale 🔥</p>
                    <p className="text-xs text-red-600/70">Produk akan ditandai diskon di halaman pembeli.</p>
                  </div>
                </label>
                {formData.is_flash_sale && (
                  <div className="p-4 border-t border-red-100 bg-white">
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Upload Poster Kustom (Opsional)</label>
                    <input type="file" onChange={handleUploadPoster} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" disabled={isUploading}/>
                    {isUploading && <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse">Sedang mengupload...</p>}
                    {editingProduct.image_poster && (
                      <label className="flex items-center gap-2 mt-4 p-2 bg-orange-50 border border-orange-100 rounded-lg cursor-pointer hover:bg-orange-100 transition">
                        <input type="checkbox" checked={formData.delete_poster} onChange={(e) => setFormData({...formData, delete_poster: e.target.checked})} className="w-4 h-4 text-orange-600 rounded" />
                        <span className="text-xs font-bold text-orange-700">Hapus Poster saat klik Simpan</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-200 transition">
                <input type="checkbox" checked={formData.is_hidden} onChange={(e) => setFormData({...formData, is_hidden: e.target.checked})} className="w-5 h-5 text-slate-600 rounded focus:ring-slate-500 cursor-pointer" />
                <div>
                  <p className="font-bold text-slate-700 text-sm">Sembunyikan Produk 👁️‍🗨️</p>
                  <p className="text-xs text-slate-500">Produk tidak akan bisa dilihat dan dibeli oleh pembeli.</p>
                </div>
              </label>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition">Batal</button>
                <button type="submit" disabled={isSaving || isUploading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Simpan Setelan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// WAJIB pakai Suspense kalau kita narik query parameter dari URL biar Next.js gak error saat di-build
export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold animate-pulse text-blue-600">Menyiapkan Panel...</div>}>
      <KelolaHargaContent />
    </Suspense>
  )
}