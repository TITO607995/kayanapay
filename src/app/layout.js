"use client";

import "./globals.css";
import Link from "next/link";
import { LogIn, UserRoundPlus, User, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("kayana_token");
    setIsLoggedIn(!!token);
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isAdminPage = pathname.startsWith("/hahahatito");

  return (
    <html lang="id">
      <head>
        <title>KayanaPay - Top Up & PPOB Terpercaya</title>
        <meta name="description" content="Platform top up game dan tagihan sekejap mata." />
      </head>
      <body className="bg-slate-50 text-slate-800 font-sans min-h-screen relative flex flex-col">
        
        {!isAdminPage && (
          <nav className="bg-white border-b border-slate-200 p-3 md:p-4 sticky top-0 z-50 shadow-sm w-full relative">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 md:gap-4 px-1 md:px-4">
              
              <div className="flex-shrink-0">
                <Link href="/">
                  <h1 className="text-xl md:text-2xl font-black text-blue-600 tracking-wider italic">
                    KAYANA<span className="text-sky-400">PAY.</span>
                  </h1>
                </Link>
              </div>

              <div className="flex-1 max-w-xl hidden md:block mx-4 lg:mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari game, pulsa, atau voucher..."
                    className="w-full bg-slate-100 border border-transparent text-slate-800 text-sm rounded-full px-5 py-2.5 pl-11 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-inner"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
                <Link href="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition hidden lg:block">
                  Beranda
                </Link>
                <Link href="/cek-pesanan" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition hidden lg:block mr-2">
                  Cek Pesanan
                </Link>

                <button 
                  onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
                  className="md:hidden p-1.5 text-slate-600 hover:text-blue-600 transition"
                >
                  <Search size={20} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5 ml-1">
                  {isLoggedIn ? (
                    <Link href="/member" className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-bold px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-sm transition shadow-sm">
                      <User size={16} strokeWidth={2.5} /> <span>Profil</span>
                    </Link>
                  ) : (
                    <>
                      <Link href="/masuk" className="text-blue-600 hover:text-blue-700 font-bold text-xs md:text-sm transition px-1.5 py-2">Masuk</Link>
                      <Link href="/daftar" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm transition shadow-md shadow-blue-600/30">Daftar</Link>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
                  className="md:hidden ml-1 p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  {isMobileMenuOpen ? <X size={24} strokeWidth={2.5} /> : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/></svg>
                  )}
                </button>
              </div>
            </div>

            {isMobileSearchOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-md p-4 animate-slide-down">
                <div className="relative w-full">
                  <input type="text" placeholder="Ketik game, pulsa, voucher..." className="w-full bg-slate-100 border border-transparent text-slate-800 text-sm rounded-xl px-5 py-3 pl-11 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-inner" autoFocus />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} strokeWidth={2.5} /></div>
                </div>
              </div>
            )}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-4 py-6 flex flex-col gap-3 animate-slide-down">
                <Link href="/#kategori" className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition border border-slate-100">
                  <span className="text-xl">🏠</span> Beranda Utama
                </Link>
                <Link href="/cek-pesanan" className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition border border-slate-100"><span className="text-xl">🧾</span> Cek Pesanan Saya</Link>
                <Link href="/daftar-harga" className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition border border-slate-100"><span className="text-xl">🏷️</span> Daftar Harga Produk</Link>
              </div>
            )}
          </nav>
        )}

        <div className="flex-grow">{children}</div>
        {!isAdminPage && (
          <>
            <footer className="bg-white border-t border-slate-200 pt-14 pb-8 mt-10">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-blue-600 tracking-wider italic mb-4">KAYANAPAY<span className="text-sky-400">.</span></h2>
                    <p className="text-slate-500 text-sm leading-relaxed">Pusat layanan top up game, pulsa, paket data dan PPOB terpercaya dengan proses otomatis 24 jam untuk seluruh Indonesia.</p>
                    <div className="flex gap-2 mt-5">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">24 Jam</span>
                      <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-xs font-semibold">Otomatis</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-5 uppercase tracking-wider text-sm">Menu</h3>
                    <ul className="space-y-3 text-sm text-slate-500">
                      <li><Link href="/" className="hover:text-blue-600 transition">Beranda</Link></li>
                      <li><Link href="/cek-pesanan" className="hover:text-blue-600 transition">Cek Pesanan</Link></li>
                      <li><Link href="/daftar-harga" className="hover:text-blue-600 transition">Daftar Harga</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-5 uppercase tracking-wider text-sm">Layanan</h3>
                    <ul className="space-y-3 text-sm text-slate-500">
                      <li>🎮 Top Up Game</li>
                      <li>📱 Pulsa & Data</li>
                      <li>💡 PPOB / Tagihan</li>
                      <li>💳 E-Wallet</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-5 uppercase tracking-wider text-sm">Hubungi Kami</h3>
                    <ul className="space-y-3 text-sm text-slate-500">
                      <li><a href="https://wa.me/6285236509562" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition">WhatsApp</a></li>
                      <li><a href="https://instagram.com/rfdto._" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">Instagram</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-7 flex flex-col lg:flex-row justify-between items-center gap-5">
                  <p className="text-xs text-slate-400 text-center lg:text-left">© 2026 KAYANAPAY • Aman • Cepat • Terpercaya</p>
                  <div className="flex items-center gap-3 text-2xl opacity-70">💳 🏦 📱 ⚡</div>
                </div>
              </div>
            </footer>

            <a href="https://wa.me/6285236509562" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[99] flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-green-500 to-green-400 rounded-full shadow-[0_8px_30px_rgba(34,197,94,0.4)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 group">
              <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span></span>
              <span className="text-3xl drop-shadow-md">👨‍💻</span>
            </a>
          </>
        )}

      </body>
    </html>
  );
}