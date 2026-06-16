"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, User, X, Menu, Phone } from "lucide-react";

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
        <title>KayanaPay – Bayar Semua Kebutuhan Digital</title>
        <meta name="description" content="Top up game, bayar tagihan listrik, air, pulsa, BPJS – cepat, murah, dan aman untuk semua kalangan." />
      </head>
      {/* Background utama dibiarkan netral, tapi kita pastikan minimalis */}
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900">

        {/* ===== PREMIUM NAVBAR ===== */}
        {!isAdminPage && (
          <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 lg:gap-8">

              {/* Brand Logo */}
              <Link href="/" className="flex-shrink-0 group">
                <span className="text-[20px] font-bold tracking-tight text-slate-900">
                  Kayana<span className="text-teal-600">Pay</span>
                </span>
              </Link>

              {/* Desktop Search (Clean & Modern) */}
              <div className="flex-1 max-w-md hidden md:block mx-auto">
                <div className="relative group">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Cari produk, tagihan, game..."
                    className="w-full text-[14px] rounded-2xl pl-10 pr-4 py-2.5 outline-none bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-300 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1 ml-auto">
                <Link href="/" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                  Beranda
                </Link>
                <Link href="/cek-pesanan" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                  Cek Pesanan
                </Link>
              </div>

              {/* Auth Actions & Mobile Toggles */}
              <div className="flex items-center gap-2 lg:gap-3 ml-auto lg:ml-0">
                
                {/* Mobile Search Toggle */}
                <button
                  onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
                  className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Search size={20} />
                </button>

                {/* Auth Buttons */}
                {isLoggedIn ? (
                  <Link href="/member" className="flex items-center gap-2 text-[14px] font-semibold px-4 py-2.5 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors duration-200">
                    <User size={16} /> Profil
                  </Link>
                ) : (
                  <>
                    <Link href="/masuk" className="hidden sm:block text-[14px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
                      Masuk
                    </Link>
                    <Link href="/daftar" className="text-[14px] font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
                      Daftar
                    </Link>
                  </>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
                  className="lg:hidden p-2 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors ml-1"
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

            {/* Mobile Search Dropdown */}
            {isMobileSearchOpen && (
              <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-4 py-4 z-40">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari produk, tagihan, game..."
                    className="w-full text-[14px] rounded-2xl pl-10 pr-4 py-3 outline-none bg-slate-50 border border-slate-100 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-4 py-4 flex flex-col gap-1 z-40">
                {[
                  { href: "/", label: "Beranda" },
                  { href: "/cek-pesanan", label: "Cek Pesanan" },
                  { href: "/masuk", label: "Masuk ke Akun" },
                ].map(item => (
                  <Link key={item.href} href={item.href} className="text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-3.5 rounded-xl transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        )}

        <div className="flex-grow flex flex-col">{children}</div>

        {/* ===== PREMIUM FOOTER ===== */}
        {!isAdminPage && (
          <footer className="bg-white border-t border-slate-100 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
              
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-16">
                
                {/* Brand Identity */}
                <div className="md:col-span-5 lg:col-span-5">
                  <Link href="/" className="inline-block mb-5">
                    <span className="text-[22px] font-bold tracking-tight text-slate-900">
                      Kayana<span className="text-teal-600">Pay</span>
                    </span>
                  </Link>
                  <p className="text-[14px] leading-relaxed text-slate-500 max-w-sm mb-6">
                    Pusat layanan top up game, pulsa, paket data, dan PPOB terpercaya. Platform digital cerdas untuk segala kebutuhan transaksi Anda.
                  </p>
                  
                  {/* Premium Badges */}
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      24 Jam
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wide">
                      Otomatis
                    </span>
                  </div>
                </div>

                {/* Footer Links Columns */}
                <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-900 mb-5">Menu</h3>
                    <ul className="space-y-3.5">
                      {["Beranda", "Cek Pesanan"].map((label, idx) => (
                        <li key={idx}>
                          <Link href={idx === 0 ? "/" : "/cek-pesanan"} className="text-[14px] text-slate-500 hover:text-teal-600 transition-colors duration-200">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-900 mb-5">Layanan</h3>
                    <ul className="space-y-3.5">
                      {["Top Up Game", "Pulsa & Data", "PPOB / Tagihan", "Voucher Digital"].map((label, idx) => (
                        <li key={idx}>
                          <span className="text-[14px] text-slate-500 cursor-pointer hover:text-teal-600 transition-colors duration-200">{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-900 mb-5">Legalitas</h3>
                    <ul className="space-y-3.5">
                      <li>
                        <Link href="/terms-of-service" className="text-[14px] text-slate-500 hover:text-teal-600 transition-colors duration-200">Syarat & Ketentuan</Link>
                      </li>
                      <li>
                        <Link href="/privacy-policy" className="text-[14px] text-slate-500 hover:text-teal-600 transition-colors duration-200">Kebijakan Privasi</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Section (Copyright & Socials) */}
              <div className="pt-8 border-t border-slate-100 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                <p className="text-[13px] text-slate-400 font-medium">
                  © 2026 PT Kayana Jaya Makmur. All rights reserved.
                </p>
                
              <div className="flex items-center gap-3">
                <a href="https://wa.me/6285236509562" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-all duration-200 hover:-translate-y-0.5" aria-label="WhatsApp">
                  <Phone size={18} />
                </a>
                <a href="https://instagram.com/rfdto._" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200 hover:-translate-y-0.5" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </a>
              </div>
              </div>

            </div>
          </footer>
        )}

        {/* ===== FLOATING WHATSAPP BUTTON (Premium Clean) ===== */}
        {!isAdminPage && (
          <a
            href="https://wa.me/6285236509562"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-[52px] h-[52px] rounded-full bg-teal-600 text-white shadow-[0_8px_30px_rgb(13,148,136,0.3)] hover:bg-teal-700 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(13,148,136,0.4)] transition-all duration-300"
            title="Hubungi CS via WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}
      </body>
    </html>
  );
}