"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("kayana_admin_token");
    if (adminToken) setIsAuthenticated(true);
    setIsChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("kayana_admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        setErrorMsg(data.message || "Username atau Password salah.");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server.");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("kayana_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500 animate-pulse">Memuat sistem...</p>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 w-full max-w-sm">
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Panel Admin</p>
            <h2 className="text-xl font-semibold text-slate-800">KayanaPay</h2>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                placeholder="Username admin"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                placeholder="Password admin"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-50 mt-2"
            >
              {isLoading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition">
              ← Kembali ke web utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { href: "/hahahatito",              icon: "📊", label: "Dashboard",          exact: true  },
    { href: "/hahahatito/transaksi",    icon: "🧾", label: "Transaksi",          exact: false },
    { href: "/hahahatito/harga",        icon: "💰", label: "Kelola Harga",       exact: false },
    { href: "/hahahatito/member",       icon: "👥", label: "Kelola Member",      exact: false },
    { href: "/hahahatito/promo",        icon: "🎟️", label: "Kode Promo",         exact: false },
    { href: "/hahahatito/banner",       icon: "🖼️", label: "Banner Web",         exact: false },
    { href: "/hahahatito/pengaturan",   icon: "⚙️", label: "Pengaturan",         exact: false },
  ];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-56 bg-white border-r border-slate-200
          flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            Kayana<span className="text-emerald-600">Admin</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition
                ${isActive(item)
                  ? "bg-slate-900 text-white font-medium"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }
              `}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 flex-shrink-0">
          {/* Hamburger mobile */}
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title — ambil dari nav items */}
          <span className="text-sm font-medium text-slate-700">
            {navItems.find(isActive)?.label ?? "Admin"}
          </span>

          {/* Avatar */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
              T
            </div>
            <span className="text-sm text-slate-600 hidden sm:block">Tito</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}