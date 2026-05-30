"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cek apakah ada token admin yang tersimpan
    const adminToken = localStorage.getItem("kayana_admin_token");
    if (adminToken) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // FRONTEND CUMA NEMBAK DATA KE LARAVEL, GAK ADA PASSWORD HARDCODE DI SINI
      const res = await fetch("http://192.168.100.17:8000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.status === "success") {
        // Kalau Laravel bilang oke, simpan token dari Laravel
        localStorage.setItem("kayana_admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        setErrorMsg(data.message || "Username atau Password salah.");
      }
    } catch (error) {
      setErrorMsg("Gagal terhubung ke server keamanan.");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("kayana_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (isChecking) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold">Memuat Sistem Keamanan...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 italic">
              KAYANA<span className="text-blue-600">ADMIN</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">Pusat Kendali. Masukkan kredensial Anda.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-100 text-center font-bold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Username Admin" required />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Password Admin" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 mt-4 disabled:bg-blue-400">
              {isLoading ? "Memverifikasi..." : "Masuk Panel Admin"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-400 hover:text-blue-600 transition">← Kembali ke Web Pembeli</Link>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN DASHBOARD ADMIN
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white italic tracking-wider">
            KAYANA<span className="text-sky-400">ADMIN</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Control Panel v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/hahahatito" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/hahahatito' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span>📊</span> Dashboard
          </Link>
          <Link href="/hahahatito/harga" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.includes('/hahahatito/harga') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span>💰</span> Kelola Harga & Diskon
          </Link>
          <Link href="/hahahatito/banner" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.includes('/hahahatito/banner') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span>🖼️</span> Kelola Banner Web
          </Link>
          <Link href="/hahahatito/transaksi" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.includes('/hahahatito/transaksi') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <span>🧾</span> Kelola Transaksi
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-3 rounded-xl transition font-bold text-sm">
            🚪 Keluar Panel
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <h1 className="font-bold text-slate-700">Mode Administrator</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">T</div>
            <span className="text-sm font-bold text-slate-600">Tito</span>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}