"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // State Management
  const [step, setStep] = useState(1); // Step 1: Input WA, Step 2: Input OTP & Password Baru
  const [whatsapp, setWhatsapp] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fungsi Langkah 1: Minta OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("https://kayanamart.my.id/api/member/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ whatsapp })
      });

      const data = await res.json();

      if (data.status === "success") {
        setSuccessMessage(data.message);
        setStep(2); // Lanjut ke form input OTP
      } else {
        setErrorMessage(data.message || "Terjadi kesalahan sistem.");
      }
    } catch (error) {
      setErrorMessage("Koneksi bermasalah. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi Langkah 2: Verifikasi & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("https://kayanamart.my.id/api/member/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          whatsapp, 
          otp, 
          new_password: newPassword 
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        setSuccessMessage("✅ " + data.message);
        // Tunggu 2 detik, lalu tendang ke halaman login
        setTimeout(() => {
          router.push("/masuk");
        }, 2000);
      } else {
        setErrorMessage(data.message || "Terjadi kesalahan sistem.");
      }
    } catch (error) {
      setErrorMessage("Koneksi bermasalah. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Biru/Hijau Kayana */}
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-2xl font-black tracking-tight">KAYANAPAY</h1>
          <p className="text-emerald-100 text-sm mt-1">Pemulihan Akses Akun</p>
        </div>

        <div className="p-6 md:p-8">
          
          {/* Pesan Notifikasi Global */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-bold text-center">
              {successMessage}
            </div>
          )}

          {/* =========================================
              STEP 1: FORM INPUT WHATSAPP
              ========================================= */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Lupa Password?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Masukkan nomor WhatsApp yang terdaftar. Kami akan mengirimkan 6 digit kode OTP.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor WhatsApp</label>
                <input
                  type="number"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-emerald-200 transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-blue-500/30 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Kirim Kode OTP"
                )}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => router.push("/masuk")}
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  Batal dan kembali ke Login
                </button>
              </div>
            </form>
          )}


          {/* =========================================
              STEP 2: FORM INPUT OTP & PASSWORD BARU
              ========================================= */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">Verifikasi OTP</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Masukkan 6 digit kode yang dikirim ke WA <span className="font-bold text-slate-700">{whatsapp}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kode OTP (6 Digit)</label>
                <input
                  type="number"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Masukkan 6 digit angka"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-emerald-200 transition font-bold text-center tracking-[0.5em]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-emerald-200 transition font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Simpan Password Baru"
                )}
              </button>

              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition"
                >
                  Kirim ulang OTP ke nomor lain
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}