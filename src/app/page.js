"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import FlashSale from "@/components/FlashSale";

const IcoTag     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoZap     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const IcoLock    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoBox     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IcoMsg     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcoWand    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2m-1.636-4.364L10.95 6.05M17.05 17.05l-1.414-1.414M8.464 17.05L7.05 15.636M12.364 4.636L10.95 6.05M3 21l9-9"/></svg>;

const ProductCard = ({ item }) => (
  <Link 
    href={item.link}
    className="group relative bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:border-slate-200/80 flex flex-col items-center text-center"
  >
    <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 relative mb-4">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={e => { e.target.src = `https://placehold.co/400x400/F8FAFC/0F6B40?text=${encodeURIComponent(item.name)}`; }}
      />
    </div>
    <div className="w-full px-1 pb-1">
      <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-600 transition-colors duration-200">
        {item.name}
      </h4>
      <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
        {item.publisher}
      </p>
    </div>
  </Link>
);

const FaqItem = ({ q, a, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)]' : 'border-slate-100'}`}>
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4.5 text-left transition-colors hover:bg-slate-50/50"
      >
        <span className="text-sm font-semibold text-slate-800 pr-4">{q}</span>
        <svg 
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-emerald-600" : "rotate-0"}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white border-t border-slate-50 text-sm text-slate-500 leading-relaxed pt-4 animate-fadeIn">
          {a}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [banners, setBanners]               = useState([]);
  const [currentBanner, setCurrentBanner]   = useState(0);
  const [activeFilter, setActiveFilter]     = useState("all");
  const prodRef = useRef(null);

  // 🔥 1. Pisahkan fungsi narik data banner
  const fetchBanners = useCallback(() => {
    fetch("https://kayanamart.my.id/api/banners")
      .then(r => r.json())
      .then(d => { if (d.status === "success") setBanners(d.data); })
      .catch(console.error);
  }, []);

  // 🔥 2. Pasang Antena Reverb untuk mantau perubahan banner dari Admin
  useEffect(() => {
    fetchBanners();

    if (typeof window !== 'undefined' && window.Echo) {
      window.Echo.channel('kayana-public-channel')
        .listen('.banner.updated', () => {
          // Banner di admin berubah, web pelanggan otomatis fetch ulang diam-diam
          fetchBanners();
        });
    }

    return () => {
      if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.leaveChannel('kayana-public-channel');
      }
    };
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setCurrentBanner(p => p === banners.length - 1 ? 0 : p + 1), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const handleFilter = id => {
    setActiveFilter(id);
    setTimeout(() => {
      if (prodRef.current) {
        const yOffset = -90; 
        const y = prodRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 50);
  };

  const menuGames = [
    { name:"Mobile Legends",  publisher:"Moonton",        link:"/ml",           isHot:true,  image:"/images/ml.png" },
    { name:"Free Fire",       publisher:"Garena",         link:"/ff",           isHot:true,  image:"/images/ff.png" },
    { name:"Magic Chess",     publisher:"Moonton",        link:"/magic-chess",  isHot:false, image:"/images/mcgg.jpg" },
    { name:"Point Blank",     publisher:"Zepetto",        link:"/pb",           isHot:false, image:"/images/pb.jpg" },
    { name:"Arena of Valor",  publisher:"Garena",         link:"/aov",          isHot:false, image:"/images/aov.png" },
    { name:"Valorant",        publisher:"Riot Games",     link:"/valorant",     isHot:true,  image:"/images/valo.jpg" },
    { name:"PUBG Mobile",     publisher:"Tencent",        link:"/pubgm",        isHot:false, image:"/images/pubg.png" },
    { name:"Call of Duty",    publisher:"Garena",         link:"/codm",         isHot:false, image:"/images/cod.jpg" },
    { name:"Lords Mobile",    publisher:"IGG",            link:"/lords-mobile", isHot:false, image:"/images/lordmobile.png" },
    { name:"Genshin Impact",  publisher:"HoYoverse",      link:"/genshin",      isHot:true,  image:"/images/genshin.jpg" },
    { name:"Stumble Guys",    publisher:"Scopely",        link:"/stumble-guys", isHot:false, image:"/images/SG.png" },
    { name:"FC Mobile",       publisher:"EA Sports",      link:"/fc-mobile",    isHot:false, image:"/images/fcm.jpg" },
    { name:"Honor of Kings",  publisher:"Level Infinite", link:"/hok",          isHot:false, image:"/images/hok.png" },
    { name:"Blood Strike",    publisher:"NetEase",        link:"/blood-strike", isHot:false, image:"/images/bs.jpg" },
    { name:"Draconia Saga",   publisher:"Sugarfun",       link:"/draconia",     isHot:false, image:"/images/DS.png" },
    { name:"Delta Force",     publisher:"TiMi Studio",    link:"/delta-force",  isHot:false, image:"/images/DF.png" },
  ];
  const menuVoucher = [
    { name:"Google Play ID",  publisher:"Google",       link:"/google-play",    isHot:true,  image:"/images/gplay.png" },
    { name:"Garena",          publisher:"Garena",       link:"/garena-voucher", isHot:false, image:"/images/garena.jpg" },
    { name:"Steam Wallet",    publisher:"Valve",        link:"/steam",          isHot:false, image:"/images/STW.jpg" },
    { name:"Spotify",         publisher:"Spotify",      link:"/spotify",        isHot:false, image:"/images/spotify.png" },
    { name:"Vidio",           publisher:"Emtek Group",  link:"/vidio",          isHot:false, image:"/images/vidio.png" },
    { name:"WeTV",            publisher:"Tencent",      link:"/wetv",           isHot:false, image:"/images/wetv.jpg" },
    { name:"e-Meterai",       publisher:"PERURI",       link:"/emeterai",       isHot:false, image:"/images/EM.png" },
    { name:"Viu",             publisher:"PCCW Media",   link:"/viu",            isHot:false, image:"/images/viu.png" },
  ];
  const menuPulsa = [
    { name:"Token PLN",  publisher:"PLN Group",       link:"/pln",       isHot:false, image:"/images/pln.jpg" },
    { name:"Telkomsel",  publisher:"Telkomsel",        link:"/telkomsel", isHot:true,  image:"/images/telkomsel.png" },
    { name:"Indosat",    publisher:"Indosat Ooredoo",  link:"/indosat",   isHot:false, image:"/images/indosat.jpg" },
    { name:"Axis",       publisher:"Axis Telekom",     link:"/axis",      isHot:false, image:"/images/axis.png" },
    { name:"Smartfren",  publisher:"Smartfren",        link:"/smartfren", isHot:false, image:"/images/smartfren.png" },
    { name:"Tri",        publisher:"Hutchison 3",      link:"/tri",       isHot:false, image:"/images/tri.jpg" },
    { name:"XL",         publisher:"XL Axiata",        link:"/xl",        isHot:false, image:"/images/XL.jpg" },
    { name:"by.U",       publisher:"Telkomsel",        link:"/byu",       isHot:false, image:"/images/by.u.png" },
  ];
  const menuTagihan = [
    { name:"BPJS Kesehatan",       publisher:"BPJS Kesehatan", link:"/bpjs-kesehatan", isHot:true,  image:"/images/bpjs.jpg" },
    { name:"PDAM Daerah",          publisher:"Daerah",         link:"/pdam",           isHot:false, image:"/images/pdam.png" },
    { name:"Pajak PBB",            publisher:"Pajak Negara",   link:"/pbb",            isHot:false, image:"/images/pbb.jpeg" },
    { name:"BPJS Ketenagakerjaan", publisher:"BPJS TK",        link:"/bpjs-tk",        isHot:false, image:"/images/bpjstk.jpg" },
  ];

  const sections = [
    { id:"games",         title:"Top Up Games",      data:menuGames },
    { id:"voucher",       title:"Voucher Digital",   data:menuVoucher },
    { id:"pulsa",         title:"Pulsa, Data & PLN", data:menuPulsa },
    { id:"tagihan",       title:"Bayar Tagihan",     data:menuTagihan },
  ];

  const filters = [
    { id:"all",          label:"Semua Produk" },
    { id:"games",        label:"Game Online" },
    { id:"voucher",      label:"Voucher Digital" },
    { id:"pulsa",        label:"Pulsa & Listrik" },
    { id:"tagihan",      label:"Tagihan Umum" },
  ];

  const faqs = [
    { q:"Apa itu KayanaPay?", a:"KayanaPay adalah platform digital terpercaya untuk top up game, isi pulsa, paket data, voucher premium, hingga pembayaran tagihan bulanan secara otomatis dengan sistem terintegrasi 24 jam." },
    { q:"Berapa lama proses transaksi?", a:"Sistem otomatis kami memproses transaksi secara real-time dalam hitungan detik. Beberapa produk seasonal mungkin membutuhkan waktu verifikasi singkat berkisar 1–3 menit." },
    { q:"Metode pembayaran apa saja yang tersedia?", a:"Kami menyediakan opsi pembayaran super lengkap mulai dari QRIS Tanpa Biaya Admin, e-Wallet terkemuka, Virtual Account Bank utama Indonesia, hingga gerai retail minimarket." },
    { q:"Apakah transaksi di KayanaPay aman?", a:"Sangat aman. Setiap transaksi dilindungi enkripsi data standar industri finansial terkini untuk menjamin privasi serta keamanan dana pelanggan dari hulu ke hilir." },
    { q:"Bagaimana jika item belum masuk?", a:"Jika transaksi berstatus berhasil namun item belum terkirim, silakan gunakan fitur Cek Pesanan atau hubungi Customer Support WhatsApp resmi kami dengan melampirkan invoice id." },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-800">

      {/* ── PREMIUM HERO BANNER ─── */}
      {banners.length > 0 && (
        <section className="bg-white border-b border-slate-100 py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 aspect-[21/9] sm:aspect-[21/8]">
              {banners.map((bn, i) => (
                <Link key={bn.id} href={bn.target_link || "#"}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentBanner ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"}`}>
                  <img src={`https://kayanamart.my.id${bn.image_url}`} alt={`Promo Banner ${i+1}`} className="w-full h-full object-cover"/>
                </Link>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {banners.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? "w-6 bg-slate-900" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── STRIPE/APPLE STYLE STATIC HERO HERO (FALLBACK) ─── */}
      {banners.length === 0 && (
        <section className="bg-white border-b border-slate-100 overflow-hidden py-14 md:py-24">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-7 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-full px-3.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Authorized Digital PPOB Gateway
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Top up produk game,<br/> voucher & tagihan rutin <br/>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">dalam hitungan detik.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed font-medium mx-auto md:mx-0">
                Nikmati kemudahan pembelian voucher digital, token listrik, saldo game, dan pembayaran tagihan multi-operator dengan instan tanpa kendala.
              </p>
              <div className="flex flex-wrap gap-3.5 justify-center md:justify-start pt-2">
                <Link href="#produk" className="text-sm font-bold px-6 py-3 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition active:scale-[0.98]">
                  Jelajahi Produk
                </Link>
                <Link href="/cek-pesanan" className="text-sm font-bold px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition active:scale-[0.98]">
                  Lacak Pesanan
                </Link>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] divide-y divide-slate-50 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Arus Transaksi Live</span>
                  <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                    ONLINE
                  </span>
                </div>
                {[
                  { ico:"⚔️", name:"Mobile Legends", sub:"86 Diamonds", price:"Rp 19.900" },
                  { ico:"⚡", name:"Token Listrik PLN", sub:"Nominal Rp 100.000", price:"Rp 100.500" },
                  { ico:"🏥", name:"BPJS Kesehatan", sub:"Iuran Periode Aktif", price:"Rp 150.000" },
                  { ico:"📱", name:"Telkomsel Data 20GB", sub:"Paket Internet Instan", price:"Rp 65.000" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/30 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-base flex-shrink-0">{r.ico}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{r.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{r.sub}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-slate-900">{r.price}</p>
                      <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">✓ Sukses</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── FLASH SALE SECTION ─── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 my-4">
        <FlashSale />
      </div>

      {/* ── CAPSULE FILTER CHIPS (Apple Minimalist Navigation) ─── */}
      <div id="produk" ref={prodRef} className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-slate-100 py-4 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1" style={{ scrollbarWidth: "none" }}>
            {filters.map(f => (
              <button 
                key={f.id} 
                onClick={() => handleFilter(f.id)}
                className={`flex-shrink-0 text-xs sm:text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 border ${
                  activeFilter === f.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10"
                    : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT SHOWCASE SECTIONS ─── */}
      <div className="space-y-4 max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {sections.map(sec => {
          if (activeFilter !== "all" && activeFilter !== sec.id) return null;
          return (
            <section key={sec.id} className="bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-3xl p-6 md:p-8 transition-all duration-300">
              <div className="mb-6 pb-2 border-b border-slate-50">
                <div className="space-y-0.5">
                  <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                    {sec.title}
                  </h2>
                  <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sec.data.map((item, i) => (
                  <ProductCard key={`${sec.id}-${i}`} item={item}/>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── WHY CHOOSE US (Stripe Feature Layout Grid) ─── */}
      <section className="bg-white border-y border-slate-100 py-16 md:py-24 my-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-14 max-w-xl text-center md:text-left space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              KAYANAPAY KEUNGGULAN
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Layanan digital premium tanpa batas.
            </h2>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
              Kami menyederhanakan cara Anda membeli saldo hiburan dan melakukan pembayaran tagihan utilitas harian Anda dengan kenyamanan maksimal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { ico:<IcoZap/>,  title:"Eksekusi Otomatis Super Instan", desc:"Modul core engine server memproses pesanan otomatis dalam fraksi detik setelah pembayaran divalidasi.", accent:true },
              { ico:<IcoLock/>, title:"Keamanan Finansial Komprehensif", desc:"Proteksi database tingkat tinggi serta enkripsi tautan data untuk jaminan keamanan menyeluruh.", accent:false },
              { ico:<IcoTag/>,  title:"Skema Harga Kompetitif & Hemat", desc:"Komitmen penawaran harga b2b terbaik bagi pembeli langsung maupun reseller tanpa beban tersembunyi.", accent:false },
              { ico:<IcoBox/>,  title:"Katalog Produk Multi-Kategori", desc:"Tersedia lebih dari 200 pilihan produk terlengkap dari publisher terkemuka dunia dan utilitas lokal.", accent:false },
              { ico:<IcoMsg/>,  title:"Bantuan Layanan CS Responsif", desc:"Dukungan helpdesk bantuan live operasional admin via WhatsApp siap sedia menyelesaikan keluhan Anda.", accent:false },
              { ico:<IcoWand/>, title:"Navigasi Antarmuka Intuitif", desc:"Tata letak visual super ringkas, elegan, dan fungsional untuk memudahkan transaksi lintas usia.", accent:false },
            ].map((w) => (
              <div 
                key={w.title}
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                  w.accent 
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10" 
                    : "bg-slate-50/50 text-slate-800 border-slate-100 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-slate-200/60"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 border ${
                  w.accent 
                    ? "bg-white/10 text-emerald-400 border-white/10" 
                    : "bg-white text-emerald-600 border-slate-200/60 shadow-sm"
                }`}>
                  {w.ico}
                </div>
                <h3 className={`text-sm font-bold mb-2 ${w.accent ? "text-white" : "text-slate-900"}`}>{w.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${w.accent ? "text-slate-300" : "text-slate-500 font-medium"}`}>{w.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="bg-slate-900 py-12 md:py-16 px-4 md:px-6 rounded-3xl max-w-6xl mx-auto my-16 shadow-xl shadow-slate-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-px sm:divide-x divide-slate-800 text-center">
            {[
              { n:"200+",  l:"Variasi Katalog Produk" },
              { n:"99.9%", l:"Rasio Keberhasilan Sistem" },
              { n:"24 Jam",  l:"Layanan Operasional Aktif" },
            ].map((s) => (
              <div key={s.l} className="space-y-1 px-4">
                <p className="text-3xl lg:text-4xl font-black text-white tracking-tight">{s.n}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Pusat Informasi
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Pertanyaan Umum FAQ
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md mx-auto lg:mx-0">
              Butuh informasi tambahan mengenai alur transaksi? Kami merangkum beberapa hal mendasar yang paling sering ditanyakan pelanggan.
            </p>
            <div className="pt-2">
              <a 
                href="https://wa.me/6285236509562" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition active:scale-[0.97]"
              >
                Buka Layanan CS WhatsApp
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            {faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} defaultOpen={i === 0}/>
            ))}
          </div>

        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 my-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-950 p-8 md:p-12 text-white shadow-xl overflow-hidden shadow-emerald-950/10 border border-emerald-800/20">
          <div className="absolute right-0 bottom-0 text-[180px] opacity-[0.03] translate-x-12 translate-y-12 pointer-events-none select-none">🪙</div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-black tracking-widest bg-white/10 text-emerald-300 border border-white/5 px-2.5 py-0.5 rounded-md uppercase">
                Penawaran Khusus
              </span>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                Mulai transaksi pertama Anda bersama KayanaPay hari ini.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Nikmati jaminan harga agen termurah, proteksi instan refund jika gagal, dan rasakan kenyamanan transaksi otomatis terlengkap.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
              <Link href="/daftar" className="text-center w-full sm:w-auto text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl bg-white text-emerald-900 shadow-sm hover:bg-slate-50 transition active:scale-[0.97]">
                Daftar Member Gratis
              </Link>
              <Link href="/cek-pesanan" className="text-center w-full sm:w-auto text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition active:scale-[0.97]">
                Lacak Transaksi
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}