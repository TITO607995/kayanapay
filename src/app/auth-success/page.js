"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Komponen utama untuk memproses Token
function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ambil token dari parameter URL (?token=xyz...)
    const token = searchParams.get("token");

    if (token) {
      // 1. Simpan token ke localStorage biar user otomatis login
      localStorage.setItem("kayana_token", token);
      
      // 2. Kasih jeda dikit biar asik animasinya, baru lempar ke halaman member
      setTimeout(() => {
        router.push("/member");
      }, 1500);
    } else {
      // Kalau kesasar masuk sini tanpa token, tendang balik ke halaman login
      router.push("/masuk?error=TokenNotFound");
    }
  }, [searchParams, router]);

  return (
    <div className="text-center">
      {/* Spinner Loading Keren */}
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Sinkronisasi Berhasil!</h2>
      <p className="text-sm text-slate-500 animate-pulse font-medium">
        Menghubungkan akun Google Anda ke KayanaPay...
      </p>
    </div>
  );
}

// Komponen Wrapper wajib pakai Suspense di Next.js App Router saat pakai useSearchParams
export default function AuthSuccessPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-50">
      <Suspense 
        fallback={
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-sm text-slate-400">Memuat halaman...</p>
          </div>
        }
      >
        <AuthSuccessContent />
      </Suspense>
    </main>
  );
}