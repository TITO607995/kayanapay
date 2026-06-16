"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MasukPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "", 
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  
  // State untuk tombol mata & Modal Lupa Password
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const cleanUsername = formData.username.replace(/\s+/g, '').toLowerCase();

    try {
      const res = await fetch("https://kayanamart.my.id/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          username: cleanUsername, 
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("kayana_token", data.data.access_token);
        setSuccessMessage("Login berhasil! Mengalihkan...");
        
        setTimeout(() => {
          router.push("/member");
        }, 1500);
      } else {
        setErrorMessage(data.message || "Username atau password salah.");
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan. Coba lagi nanti.");
      setIsLoading(false);
    }
  };

  // Fungsi untuk redirect ke endpoint Google di backend Laravel
  const handleGoogleLogin = () => {
    window.location.href = "https://kayanamart.my.id/api/auth/google";
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50 relative">
      
      {/* 🟢 NOTIFIKASI SUKSES 🟢 */}
      {successMessage && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="font-bold text-sm">{successMessage}</span>
        </div>
      )}

      {/* 🟡 MODAL Lupa Password 🟡 */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Lupa Password?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Untuk menjaga keamanan akun, proses reset password saat ini dibantu langsung oleh tim Admin kami. Silakan hubungi via WhatsApp.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowForgotModal(false)} 
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <a 
                href={`https://wa.me/6285236509562?text=Halo%20Admin%20KayanaPay,%20saya%20lupa%20password%20akun%20saya.%20Mohon%20bantuannya%20untuk%20melakukan%20reset%20password.`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                onClick={() => setShowForgotModal(false)}
              >
                Chat Admin
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-emerald-600 italic tracking-wider">
            KAYANAPAY<span className="text-sky-400">.</span>
          </h1>
          <p className="text-slate-500 text-sm mt-3">Masuk untuk melanjutkan transaksi top up dan PPOB</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Masuk Akun</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Username</label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="Masukkan username" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-blue-100 lowercase" />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-slate-600 font-medium mb-2 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} placeholder="Masukkan password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Lupa Password Trigger */}
            <div className="text-right">
              <Link 
                href="/lupa-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-bold transition"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Button */}
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-emerald-600/30 disabled:bg-blue-400">
              {isLoading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>

          {/* 🟡 GARIS PEMISAH 🟡 */}
          <div className="flex items-center my-6 gap-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400 font-medium">Atau masuk dengan</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* 🔵 TOMBOL GOOGLE 🔵 */}
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          <div className="mt-6 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/daftar" className="text-emerald-600 font-semibold hover:underline">Daftar</Link>
          </div>
        </div>
      </div>
    </main>
  );
}