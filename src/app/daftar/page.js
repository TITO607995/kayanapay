"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "", 
    whatsapp: "",
    password: "",
    password_confirmation: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State buat notif sukses
  
  // State untuk tombol mata
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleanUsername = formData.username.replace(/\s+/g, '').toLowerCase();

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage("Password dan Konfirmasi Password tidak sama!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://192.168.100.17:8000/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: `${cleanUsername}@kayanamember.com`, 
          whatsapp: formData.whatsapp,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("kayana_token", data.data.access_token);
        // Tampilkan notifikasi tipis-tipis
        setSuccessMessage("Pendaftaran berhasil! Mengalihkan...");
        
        // Jeda 1.5 detik biar user bisa baca notifnya, baru pindah halaman
        setTimeout(() => {
          router.push("/member");
        }, 1500);
      } else {
        setErrorMessage(data.message || "Gagal mendaftar. Username mungkin sudah dipakai.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan. Coba lagi nanti.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50 relative">
      
      {/* 🟢 NOTIFIKASI SUKSES (TOAST TIPIS-TIPIS) 🟢 */}
      {successMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-blue-600 italic tracking-wider">
            KAYANAPAY<span className="text-sky-400">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-3">Daftar akun baru untuk transaksi lebih cepat</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Buat Akun</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Nama Lengkap</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Nama lengkap" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Username</label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="Buat username (Tanpa spasi)" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lowercase" />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Nomor WhatsApp</label>
              <input type="number" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} placeholder="08123456789" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required minLength="6" value={formData.password} onChange={handleChange} placeholder="Minimal 6 karakter" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Konfirmasi Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} name="password_confirmation" required value={formData.password_confirmation} onChange={handleChange} placeholder="Ulangi password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-600/30 disabled:bg-blue-400">
              {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-blue-600 font-semibold hover:underline">Masuk</Link>
          </div>
        </div>
      </div>
    </main>
  );
}