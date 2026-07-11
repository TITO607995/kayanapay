"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import FlashSale from "@/components/FlashSale";

const IcoTag  = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoZap  = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const IcoLock = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IcoBox  = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IcoMsg  = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcoWand = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 4V2m0 14v-2M8 9H2m14 0h-2m-1.636-4.364L10.95 6.05M17.05 17.05l-1.414-1.414M8.464 17.05L7.05 15.636M12.364 4.636L10.95 6.05M3 21l9-9"/></svg>;

const ProductCard = ({ item }) => (
  <Link
    href={item.link}
    className="group relative bg-[#FDFCF8] rounded-2xl p-3 border border-[#E3DFD2] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/40 hover:shadow-[0_10px_28px_rgba(37,99,235,0.10)] flex flex-col items-center text-center"
  >
    {item.isHot && (
      <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-blue-600 text-white text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
        HOT
      </span>
    )}
    <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#F5F3EC] relative mb-3.5">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.target.src = `https://placehold.co/400x400/EFF6FF/2563EB?text=${encodeURIComponent(item.name)}`; }}
      />
    </div>
    <div className="w-full px-1 pb-1">
      <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors duration-200">
        {item.name}
      </h4>
      <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
        {item.publisher}
      </p>
    </div>
  </Link>
);

const FaqItem = ({ q, a, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bg-[#FDFCF8] rounded-2xl border transition-all duration-300 overflow-hidden ${open ? "border-blue-400/30 shadow-[0_6px_24px_rgba(37,99,235,0.06)]" : "border-[#E3DFD2]"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-blue-50/40"
      >
        <span className="text-sm font-semibold text-slate-800 pr-4">{q}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-blue-600" : "rotate-0 text-slate-400"}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-dashed border-[#E3DFD2] text-sm text-slate-500 leading-relaxed pt-4">
          {a}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const prodRef = useRef(null);

  const fetchBanners = useCallback(() => {
    fetch("https://kayanamart.my.id/api/banners")
      .then((r) => r.json())
      .then((d) => { if (d.status === "success") setBanners(d.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchBanners();
    if (typeof window !== "undefined" && window.Echo) {
      window.Echo.channel("kayana-public-channel").listen(".banner.updated", () => fetchBanners());
    }
    return () => {
      if (typeof window !== "undefined" && window.Echo) window.Echo.leaveChannel("kayana-public-channel");
    };
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setCurrentBanner((p) => (p === banners.length - 1 ? 0 : p + 1)), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const handleFilter = (id) => {
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
    { name: "Mobile Legends", publisher: "Moonton", link: "/ml", isHot: true, image: "/images/ml.png" },
    { name: "Free Fire", publisher: "Garena", link: "/ff", isHot: true, image: "/images/ff.png" },
    { name: "Magic Chess", publisher: "Moonton", link: "/magic-chess", isHot: false, image: "/images/mcgg.jpg" },
    { name: "Point Blank", publisher: "Zepetto", link: "/pb", isHot: false, image: "/images/pb.jpg" },
    { name: "Arena of Valor", publisher: "Garena", link: "/aov", isHot: false, image: "/images/aov.png" },
    { name: "Valorant", publisher: "Riot Games", link: "/valorant", isHot: true, image: "/images/valo.jpg" },
    { name: "PUBG Mobile", publisher: "Tencent", link: "/pubgm", isHot: false, image: "/images/pubg.png" },
    { name: "Call of Duty", publisher: "Garena", link: "/codm", isHot: false, image: "/images/cod.jpg" },
    { name: "Lords Mobile", publisher: "IGG", link: "/lords-mobile", isHot: false, image: "/images/lordmobile.png" },
    { name: "Genshin Impact", publisher: "HoYoverse", link: "/genshin", isHot: true, image: "/images/genshin.jpg" },
    { name: "Stumble Guys", publisher: "Scopely", link: "/stumble-guys", isHot: false, image: "/images/SG.png" },
    { name: "FC Mobile", publisher: "EA Sports", link: "/fc-mobile", isHot: false, image: "/images/fcm.jpg" },
    { name: "Honor of Kings", publisher: "Level Infinite", link: "/hok", isHot: false, image: "/images/hok.png" },
    { name: "Blood Strike", publisher: "NetEase", link: "/blood-strike", isHot: false, image: "/images/bs.jpg" },
    { name: "Draconia Saga", publisher: "Sugarfun", link: "/draconia", isHot: false, image: "/images/DS.png" },
    { name: "Delta Force", publisher: "TiMi Studio", link: "/delta-force", isHot: false, image: "/images/DF.png" },
  ];

  const menuVoucher = [
    { name: "Google Play ID", publisher: "Google", link: "/google-play", isHot: true, image: "/images/gplay.png" },
    { name: "Garena", publisher: "Garena", link: "/garena-voucher", isHot: false, image: "/images/garena.jpg" },
    { name: "Steam Wallet", publisher: "Valve", link: "/steam", isHot: false, image: "/images/STW.jpg" },
    { name: "Spotify", publisher: "Spotify", link: "/spotify", isHot: false, image: "/images/spotify.png" },
    { name: "Vidio", publisher: "Emtek Group", link: "/vidio", isHot: false, image: "/images/vidio.png" },
    { name: "WeTV", publisher: "Tencent", link: "/wetv", isHot: false, image: "/images/wetv.jpg" },
    { name: "e-Meterai", publisher: "PERURI", link: "/emeterai", isHot: false, image: "/images/EM.png" },
    { name: "Viu", publisher: "PCCW Media", link: "/viu", isHot: false, image: "/images/viu.png" },
  ];

  const menuPulsa = [
    { name: "Token PLN", publisher: "PLN Group", link: "/pln", isHot: false, image: "/images/pln.jpg" },
    { name: "Telkomsel", publisher: "Telkomsel", link: "/telkomsel", isHot: true, image: "/images/telkomsel.png" },
    { name: "Indosat", publisher: "Indosat Ooredoo", link: "/indosat", isHot: false, image: "/images/indosat.jpg" },
    { name: "Axis", publisher: "Axis Telekom", link: "/axis", isHot: false, image: "/images/axis.png" },
    { name: "Smartfren", publisher: "Smartfren", link: "/smartfren", isHot: false, image: "/images/smartfren.png" },
    { name: "Tri", publisher: "Hutchison 3", link: "/tri", isHot: false, image: "/images/tri.jpg" },
    { name: "XL", publisher: "XL Axiata", link: "/xl", isHot: false, image: "/images/XL.jpg" },
    { name: "by.U", publisher: "Telkomsel", link: "/byu", isHot: false, image: "/images/by.u.png" },
  ];

  const menuTagihan = [
    { name: "BPJS Kesehatan", publisher: "BPJS Kesehatan", link: "/bpjs-kesehatan", isHot: true, image: "/images/bpjs.jpg" },
    { name: "Internet & WiFi", publisher: "IndiHome, Biznet", link: "/tagihan-wifi", isHot: true, image: "/images/wifi.png" },
    { name: "PDAM Daerah", publisher: "Daerah", link: "/pdam", isHot: false, image: "/images/pdam.png" },
    { name: "Pajak PBB", publisher: "Pajak Negara", link: "/pbb", isHot: false, image: "/images/pbb.jpeg" },
    { name: "BPJS Ketenagakerjaan", publisher: "BPJS TK", link: "/bpjs-tk", isHot: false, image: "/images/bpjstk.jpg" },
  ];

  const sections = [
    { id: "games",   title: "Top Up Games",      eyebrow: "GAME",          data: menuGames },
    { id: "voucher", title: "Voucher Digital",   eyebrow: "VOUCHER",       data: menuVoucher },
    { id: "pulsa",   title: "Pulsa, Data & PLN", eyebrow: "PULSA/LISTRIK", data: menuPulsa },
    { id: "tagihan", title: "Bayar Tagihan",     eyebrow: "TAGIHAN",       data: menuTagihan },
  ];

  const filters = [
    { id: "all",     label: "Semua Produk" },
    { id: "games",   label: "Game Online" },
    { id: "voucher", label: "Voucher Digital" },
    { id: "pulsa",   label: "Pulsa & Listrik" },
    { id: "tagihan", label: "Tagihan Umum" },
  ];

  const faqs = [
    { q: "Apa itu KayanaPay?", a: "KayanaPay adalah platform digital terpercaya untuk top up game, isi pulsa, paket data, voucher premium, hingga pembayaran tagihan bulanan secara otomatis dengan sistem terintegrasi 24 jam." },
    { q: "Berapa lama proses transaksi?", a: "Sistem otomatis kami memproses transaksi secara real-time dalam hitungan detik. Beberapa produk seasonal mungkin membutuhkan waktu verifikasi singkat berkisar 1–3 menit." },
    { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menyediakan pembayaran QRIS tanpa biaya admin, kompatibel dengan seluruh e-wallet dan mobile banking yang mendukung QRIS." },
    { q: "Apakah transaksi di KayanaPay aman?", a: "Sangat aman. Setiap transaksi dilindungi enkripsi data standar industri finansial terkini untuk menjamin privasi serta keamanan dana pelanggan dari hulu ke hilir." },
    { q: "Bagaimana jika item belum masuk?", a: "Jika transaksi berstatus berhasil namun item belum terkirim, silakan gunakan fitur Cek Pesanan atau hubungi Customer Support WhatsApp resmi kami dengan melampirkan invoice id." },
  ];

  const features = [
    { ico: IcoZap,  tag: "PROSES::OTOMATIS",  title: "Item masuk dalam hitungan detik",         desc: "Server memvalidasi pembayaran lalu mengeksekusi pesanan tanpa antre, tanpa admin standby.", accent: true },
    { ico: IcoLock, tag: "ENKRIPSI::AES-256",  title: "Data & dana kamu terkunci rapat",         desc: "Setiap transaksi lewat jalur terenkripsi, dari checkout sampai konfirmasi selesai.",        accent: false },
    { ico: IcoTag,  tag: "HARGA::TETAP",       title: "Satu harga untuk semua, tanpa kejutan",  desc: "Nominal yang tertera di struk adalah nominal yang kamu bayar — tidak ada biaya tersembunyi.", accent: false },
    { ico: IcoBox,  tag: "KATALOG::200+",      title: "Satu tempat, semua kebutuhan digital",   desc: "Game, voucher, pulsa, sampai tagihan rutin — tersedia dalam satu daftar produk.",            accent: false },
    { ico: IcoMsg,  tag: "CS::STANDBY",        title: "Ada yang mendengarkan, bukan bot doang", desc: "Kendala transaksi dijawab langsung lewat WhatsApp oleh admin, bukan antrean tiket.",         accent: false },
    { ico: IcoWand, tag: "UX::RINGKAS",        title: "Checkout singkat, tanpa langkah muter",  desc: "Dari pilih produk sampai bayar, semuanya bisa selesai dalam satu halaman.",                  accent: false },
  ];

  return (
    <main className="min-h-screen bg-[#F5F3EC] text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-700">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* ── BANNER ───────────────────────────────────────────── */}
      {banners.length > 0 && (
        <section className="bg-[#F5F3EC] py-6 md:py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="relative rounded-3xl overflow-hidden bg-[#FDFCF8] border border-[#E3DFD2] aspect-[21/9] sm:aspect-[21/8]">
              {banners.map((bn, i) => (
                <Link key={bn.id} href={bn.target_link || "#"}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentBanner ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"}`}>
                  <img src={`https://kayanamart.my.id${bn.image_url}`} alt={`Promo Banner ${i + 1}`} className="w-full h-full object-cover" />
                </Link>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FLASH SALE ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 my-4">
        <FlashSale />
      </div>

      {/* ── FILTER BAR ───────────────────────────────────────── */}
      <div id="produk" ref={prodRef} className="sticky top-0 z-40 bg-[#F5F3EC]/95 backdrop-blur-md border-b border-[#E3DFD2] py-4">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex gap-2.5 overflow-x-auto py-1" style={{ scrollbarWidth: "none" }}>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilter(f.id)}
                className={`flex-shrink-0 text-xs sm:text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 border ${
                  activeFilter === f.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                    : "bg-[#FDFCF8] text-slate-500 border-[#E3DFD2] hover:border-blue-300 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT SECTIONS ─────────────────────────────────── */}
      <div className="space-y-4 max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {sections.map((sec) => {
          if (activeFilter !== "all" && activeFilter !== sec.id) return null;
          return (
            <section key={sec.id} className="bg-[#FDFCF8] border border-[#E3DFD2] rounded-3xl p-6 md:p-8">
              <div className="mb-6 pb-3 border-b border-dashed border-[#E3DFD2] flex items-baseline justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
                  {sec.title}
                </h2>
                <span className="text-[10px] font-bold tracking-widest text-blue-500 hidden sm:inline" style={{ fontFamily: "monospace" }}>
                  {sec.eyebrow}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sec.data.map((item, i) => (
                  <ProductCard key={`${sec.id}-${i}`} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="bg-[#FDFCF8] border-y border-[#E3DFD2] py-16 md:py-24 my-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-xl space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600" style={{ fontFamily: "monospace" }}>
              == KAYANAPAY LINE ITEMS ==
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Apa yang tertulis di struk, itu yang kamu dapat.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((w) => (
              <div
                key={w.title}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  w.accent
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                    : "bg-[#F5F3EC] text-slate-800 border-[#E3DFD2] hover:border-blue-200 hover:bg-[#FDFCF8]"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    w.accent
                      ? "bg-white/10 text-white border-white/15"
                      : "bg-[#FDFCF8] text-blue-600 border-[#E3DFD2]"
                  }`}>
                    <w.ico className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-bold tracking-widest ${w.accent ? "text-blue-100/70" : "text-blue-400"}`} style={{ fontFamily: "monospace" }}>
                    {w.tag}
                  </span>
                </div>
                <h3 className={`text-sm font-bold mb-2 ${w.accent ? "text-white" : "text-slate-800"}`}>{w.title}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${w.accent ? "text-blue-100" : "text-slate-500"}`}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100" style={{ fontFamily: "monospace" }}>
              Pusat Informasi
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Pertanyaan Umum
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto lg:mx-0">
              Butuh informasi tambahan mengenai alur transaksi? Kami rangkum yang paling sering ditanyakan.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/6285236509562"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition active:scale-[0.97] shadow-md shadow-blue-600/20"
              >
                Buka Layanan CS WhatsApp
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            {faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 my-16">
        <div className="relative rounded-3xl bg-zinc-900 p-8 md:p-12 text-white overflow-hidden border border-white/10 shadow-xl shadow-black/20">
          <div className="absolute right-6 bottom-0 text-[160px] leading-none opacity-[0.05] pointer-events-none select-none" style={{ fontFamily: "monospace" }}>$</div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-bold tracking-widest bg-[#F2A93B]/15 text-[#F2A93B] border border-[#F2A93B]/25 px-2.5 py-0.5 rounded-md uppercase" style={{ fontFamily: "monospace" }}>
                Penawaran Khusus
              </span>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-snug">
                Transaksi pertamamu, struk pertamamu.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Daftar gratis, dapat harga agen dari transaksi pertama, dan proteksi refund otomatis kalau gagal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
              <Link href="/daftar" className="text-center w-full sm:w-auto text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl bg-[#F2A93B] text-zinc-900 hover:brightness-95 transition active:scale-[0.97] shadow-md">
                Daftar Member Gratis
              </Link>
              <Link href="/cek-pesanan" className="text-center w-full sm:w-auto text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition active:scale-[0.97]">
                Lacak Transaksi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}