"use client";

import { useState, useEffect, useCallback } from "react";

// ── Toast (Tanpa Emoji, Menggunakan SVG) ──────────────────────────────────────
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
const authHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export default function PengaturanSistemPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  // State Pengaturan
  const [settings, setSettings] = useState({
    DIGIFLAZZ_USERNAME: "",
    DIGIFLAZZ_PROD_KEY: "",
    DIGIFLAZZ_DEV_KEY: "",
    DIGIFLAZZ_MODE: "development",
    
    DUITKU_MERCHANT_CODE: "",
    DUITKU_PROD_KEY: "",
    DUITKU_DEV_KEY: "",
    DUITKU_MODE: "development",
    
    FONNTE_TOKEN: "",
    
    MAINTENANCE_MODE: "false"
  });

  // State untuk Toggle Password
  const [showKeys, setShowKeys] = useState({
    DIGIFLAZZ_DEV: false,
    DIGIFLAZZ_PROD: false,
    DUITKU_DEV: false,
    DUITKU_PROD: false,
    FONNTE: false,
  });

  const toggleKey = (key) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // Tarik Data
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/settings", {
        headers: authHeaders(),
      });
      const data = await res.json();
      
      if (data.status === "success" && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      } else {
        showToast("Gagal memuat pengaturan: " + data.message, "error");
      }
    } catch (error) {
      showToast("Gagal terhubung ke server.", "error");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/settings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      
      if (data.status === "success") {
        showToast(data.message || "Pengaturan berhasil disimpan!");
      } else {
        showToast("Gagal: " + (data.message || "Gagal menyimpan pengaturan."), "error");
      }
    } catch (error) {
      showToast("Kesalahan jaringan.", "error");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs text-slate-400 mt-0.5">Atur kredensial API Payment Gateway, Supplier, dan Mode Sistem.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="px-5 py-2.5 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSave}>
          
          {/* BARIS 1: DIGIFLAZZ & DUITKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* KOTAK DIGIFLAZZ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-sm font-semibold text-slate-800">Supplier: Digiflazz</h3>
                <p className="text-xs text-slate-400 mt-0.5">Konfigurasi stok dan harga modal PPOB.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Username Digiflazz</label>
                <input type="text" name="DIGIFLAZZ_USERNAME" value={settings.DIGIFLAZZ_USERNAME} onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                  placeholder="Masukkan username" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Mode API Saat Ini</label>
                <select name="DIGIFLAZZ_MODE" value={settings.DIGIFLAZZ_MODE} onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition font-medium text-slate-700">
                  <option value="development">Development (Testing)</option>
                  <option value="production">Production (Live / Saldo Asli)</option>
                </select>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">API Key Development</label>
                  <div className="relative">
                    <input type={showKeys.DIGIFLAZZ_DEV ? "text" : "password"} name="DIGIFLAZZ_DEV_KEY" value={settings.DIGIFLAZZ_DEV_KEY} onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                      placeholder="Masukkan Dev Key" />
                    <button type="button" onClick={() => toggleKey("DIGIFLAZZ_DEV")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 hover:text-slate-600">
                      {showKeys.DIGIFLAZZ_DEV ? "SEMBUNYIKAN" : "TAMPILKAN"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">API Key Production</label>
                  <div className="relative">
                    <input type={showKeys.DIGIFLAZZ_PROD ? "text" : "password"} name="DIGIFLAZZ_PROD_KEY" value={settings.DIGIFLAZZ_PROD_KEY} onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                      placeholder="Masukkan Prod Key" />
                    <button type="button" onClick={() => toggleKey("DIGIFLAZZ_PROD")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 hover:text-slate-600">
                      {showKeys.DIGIFLAZZ_PROD ? "SEMBUNYIKAN" : "TAMPILKAN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KOTAK DUITKU */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-sm font-semibold text-slate-800">Payment: Duitku</h3>
                <p className="text-xs text-slate-400 mt-0.5">Konfigurasi gerbang pembayaran pembeli.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Kode Merchant</label>
                <input type="text" name="DUITKU_MERCHANT_CODE" value={settings.DUITKU_MERCHANT_CODE} onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                  placeholder="Misal: D12345" />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Mode API Saat Ini</label>
                <select name="DUITKU_MODE" value={settings.DUITKU_MODE} onChange={handleChange} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition font-medium text-slate-700">
                  <option value="development">Sandbox (Uji Coba)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">API Key Sandbox</label>
                  <div className="relative">
                    <input type={showKeys.DUITKU_DEV ? "text" : "password"} name="DUITKU_DEV_KEY" value={settings.DUITKU_DEV_KEY} onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                      placeholder="Masukkan Sandbox Key" />
                    <button type="button" onClick={() => toggleKey("DUITKU_DEV")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 hover:text-slate-600">
                      {showKeys.DUITKU_DEV ? "SEMBUNYIKAN" : "TAMPILKAN"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5">API Key Production</label>
                  <div className="relative">
                    <input type={showKeys.DUITKU_PROD ? "text" : "password"} name="DUITKU_PROD_KEY" value={settings.DUITKU_PROD_KEY} onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                      placeholder="Masukkan Prod Key" />
                    <button type="button" onClick={() => toggleKey("DUITKU_PROD")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 hover:text-slate-600">
                      {showKeys.DUITKU_PROD ? "SEMBUNYIKAN" : "TAMPILKAN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BARIS 2: BOT WA & MAINTENANCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* KOTAK WA FONNTE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-sm font-semibold text-slate-800">WhatsApp Bot (Fonnte)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Notifikasi otomatis untuk transaksi sistem.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Fonnte API Token</label>
                <div className="relative">
                  <input type={showKeys.FONNTE ? "text" : "password"} name="FONNTE_TOKEN" value={settings.FONNTE_TOKEN} onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-20 py-2.5 text-sm outline-none focus:border-slate-400 transition" 
                    placeholder="Masukkan token Fonnte" />
                  <button type="button" onClick={() => toggleKey("FONNTE")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 hover:text-slate-600">
                    {showKeys.FONNTE ? "SEMBUNYIKAN" : "TAMPILKAN"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Pastikan device sudah terhubung di dashboard Fonnte agar bot dapat berjalan dengan normal.</p>
            </div>

            {/* KOTAK MAINTENANCE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-sm font-semibold text-slate-800">Mode Sistem</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pengaturan status akses website.</p>
              </div>

              <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                <div className="flex items-center h-5 mt-0.5">
                  <input 
                    type="checkbox" 
                    name="MAINTENANCE_MODE" 
                    checked={settings.MAINTENANCE_MODE === "true"} 
                    onChange={handleChange} 
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer" 
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Aktifkan Mode Maintenance</p>
                  <p className="text-xs text-slate-500 mt-0.5">Jika diaktifkan, halaman utama akan ditutup dan menampilkan pesan sedang dalam perbaikan.</p>
                </div>
              </label>
            </div>

          </div>

        </form>
      )}
    </div>
  );
}