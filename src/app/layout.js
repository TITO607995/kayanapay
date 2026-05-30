"use client";

import "./globals.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, User, X, Menu } from "lucide-react";

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
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)", color: "var(--text-primary)" }}>

        {/* ===== NAVBAR ===== */}
        {!isAdminPage && (
          <nav className="bg-white sticky top-0 z-50 w-full" style={{ borderBottom: "0.5px solid var(--border)" }}>
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <span className="text-lg font-semibold" style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                  Kayana<span style={{ color: "var(--teal)" }}>Pay</span>
                </span>
              </Link>

              {/* Search — desktop */}
              <div className="flex-1 max-w-sm hidden md:block mx-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    placeholder="Cari produk, tagihan, game..."
                    className="w-full text-sm rounded-2xl pl-9 pr-4 py-2 outline-none transition-all"
                    style={{
                      background: "var(--cream-2)",
                      border: "0.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--teal)"; }}
                    onBlur={e => { e.target.style.background = "var(--cream-2)"; e.target.style.borderColor = "var(--border)"; }}
                  />
                </div>
              </div>

              {/* Nav links — desktop */}
              <div className="hidden lg:flex items-center gap-1 ml-auto">
                <Link href="/" className="text-sm px-3 py-1.5 rounded-lg transition-all" style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => { e.target.style.color = "var(--text-primary)"; e.target.style.background = "var(--cream-2)"; }}
                  onMouseLeave={e => { e.target.style.color = "var(--text-secondary)"; e.target.style.background = "transparent"; }}>
                  Beranda
                </Link>
                <Link href="/cek-pesanan" className="text-sm px-3 py-1.5 rounded-lg transition-all" style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={e => { e.target.style.color = "var(--text-primary)"; e.target.style.background = "var(--cream-2)"; }}
                  onMouseLeave={e => { e.target.style.color = "var(--text-secondary)"; e.target.style.background = "transparent"; }}>
                  Cek Pesanan
                </Link>
              </div>

              {/* Auth buttons */}
              <div className="flex items-center gap-2 ml-auto lg:ml-3">
                {/* Mobile search toggle */}
                <button
                  onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
                  className="md:hidden p-1.5 rounded-lg transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Search size={18} />
                </button>

                {isLoggedIn ? (
                  <Link href="/member" className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition"
                    style={{ color: "var(--teal)", background: "var(--teal-light)", border: "0.5px solid var(--teal-border)" }}>
                    <User size={15} /> Profil
                  </Link>
                ) : (
                  <>
                    <Link href="/masuk" className="text-sm font-medium px-3 py-1.5 rounded-lg transition hidden sm:block"
                      style={{ color: "var(--teal)", background: "var(--teal-light)", border: "0.5px solid var(--teal-border)" }}>
                      Masuk
                    </Link>
                    <Link href="/daftar" className="text-sm font-medium px-3 py-1.5 rounded-lg transition text-white"
                      style={{ background: "var(--teal)" }}>
                      Daftar
                    </Link>
                  </>
                )}

                {/* Mobile hamburger */}
                <button
                  onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
                  className="lg:hidden p-1.5 rounded-lg transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile search dropdown */}
            {isMobileSearchOpen && (
              <div className="md:hidden animate-slide-down px-4 py-3" style={{ borderTop: "0.5px solid var(--border)", background: "#fff" }}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari produk, tagihan, game..."
                    className="w-full text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none"
                    style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            )}

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden animate-slide-down px-4 py-4 flex flex-col gap-2" style={{ borderTop: "0.5px solid var(--border)", background: "#fff" }}>
                {[
                  { href: "/", label: "🏠 Beranda" },
                  { href: "/cek-pesanan", label: "🧾 Cek Pesanan" },
                  { href: "/masuk", label: "🔑 Masuk" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="text-sm font-medium px-4 py-3 rounded-xl transition"
                    style={{ background: "var(--cream-2)", color: "var(--text-primary)", border: "0.5px solid var(--border)" }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        )}

        <div className="flex-grow">{children}</div>

        {/* ===== FOOTER ===== */}
        {!isAdminPage && (
          <>
            <footer className="bg-white mt-16" style={{ borderTop: "0.5px solid var(--border)" }}>
              <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

                  <div>
                    <div className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
                      Kayana<span style={{ color: "var(--teal)" }}>Pay</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
                      Pusat layanan top up game, pulsa, paket data, dan PPOB terpercaya. Proses otomatis 24 jam untuk seluruh Indonesia.
                    </p>
                    <div className="flex gap-2">
                      <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "var(--teal-light)", color: "var(--teal)", border: "0.5px solid var(--teal-border)" }}>24 Jam</span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: "var(--teal-light)", color: "var(--teal)", border: "0.5px solid var(--teal-border)" }}>Otomatis</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--text-tertiary)" }}>Menu</h3>
                    <ul className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {[["/" ,"Beranda"], ["/cek-pesanan","Cek Pesanan"]].map(([href, label]) => (
                        <li key={href}><Link href={href} className="hover:underline" style={{ color: "var(--text-secondary)" }}>{label}</Link></li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--text-tertiary)" }}>Layanan</h3>
                    <ul className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <li>Top Up Game</li>
                      <li>Pulsa &amp; Data</li>
                      <li>PPOB / Tagihan</li>
                      <li>Voucher Digital</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--text-tertiary)" }}>Hubungi Kami</h3>
                    <ul className="space-y-3 text-sm">
                      <li><a href="https://wa.me/6285236509562" target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>WhatsApp</a></li>
                      <li><a href="https://instagram.com/rfdto._" target="_blank" rel="noopener noreferrer" style={{ color: "var(--teal)" }}>Instagram</a></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: "0.5px solid var(--border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>© 2026 KayanaPay · Aman · Cepat · Terpercaya</p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Transaksi terenkripsi & dilindungi</p>
                </div>
              </div>
            </footer>

            {/* WhatsApp floating button */}
            <a
              href="https://wa.me/6285236509562"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-6 right-5 z-50 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg transition-transform hover:-translate-y-1 hover:scale-105"
              style={{ background: "var(--teal)" }}
              title="Hubungi CS via WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </>
        )}
      </body>
    </html>
  );
}