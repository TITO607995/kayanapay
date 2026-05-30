"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FlashSale from "@/components/FlashSale";

// --- Komponen Kartu Produk ---
const ProductCard = ({ item }) => (
  <Link
    href={item.link || "#"}
    className="block bg-white border border-[#E5E5E3] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-150 hover:border-[#CECCC7] hover:-translate-y-[2px] group"
  >
    <div className="aspect-[4/3] bg-[#F0EFEC] flex items-center justify-center text-[26px] relative overflow-hidden">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            e.target.src = `https://placehold.co/400x300/F0EFEC/111?text=${encodeURIComponent(item.name)}`;
          }}
        />
      ) : (
        <span>{item.emoji}</span>
      )}
      {item.isHot && (
        <div className="absolute top-1.5 right-1.5 text-[10px] font-medium text-[#0F6B40] bg-[#EBF5F0] border border-[#BAD9CA] rounded-[6px] px-[7px] py-[2px] z-10">
          Populer
        </div>
      )}
    </div>
    <div className="py-[9px] px-[11px]">
      <div className="text-[12px] font-medium whitespace-nowrap overflow-hidden text-ellipsis text-[#111]">
        {item.name}
      </div>
      <div className="text-[10px] text-[#9B9B97] mt-[1px]">{item.publisher}</div>
    </div>
  </Link>
);

// --- Header Seksi ---
const SectionHeader = ({ title }) => (
  <div className="flex items-baseline justify-between mb-[18px]">
    <div className="text-[15px] font-semibold tracking-[-0.2px] text-[#111]">{title}</div>
    <div className="text-[13px] text-[#6B6B67] cursor-pointer hover:text-[#111] transition-colors">
      Lihat semua →
    </div>
  </div>
);

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [openFaq, setOpenFaq] = useState(0);

  // Fetch Banner
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://192.168.100.17:8000/api/banners");
        const data = await res.json();
        if (data.status === "success") setBanners(data.data);
      } catch (error) {
        console.error("Gagal ambil banner:", error);
      }
    };
    fetchBanners();
  }, []);

  // Slider otomatis untuk banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Data Layanan Shortcut
  const featuredServices = [
    { name: "Token PLN", sub: "Semua nominal", link: "/pln", emoji: "⚡" },
    { name: "BPJS Kesehatan", sub: "Bayar iuran mudah", link: "/bpjs-kesehatan", emoji: "🏥" },
    { name: "Pulsa & Data", sub: "Semua operator", link: "/telkomsel", emoji: "📱" },
    { name: "PDAM", sub: "Tagihan air", link: "/pdam", emoji: "💧" },
  ];

  // Data Produk
  const menuPopuler = [
    { name: "Token PLN", publisher: "PLN Group", link: "/pln", isHot: true, image: "https://placehold.co/400x300/F0EFEC/111?text=PLN" },
    { name: "BPJS Kesehatan", publisher: "BPJS Kesehatan", link: "/bpjs-kesehatan", isHot: true, image: "https://placehold.co/400x300/F0EFEC/111?text=BPJS" },
    { name: "Mobile Legends", publisher: "Moonton", link: "/ml", isHot: true, image: "/images/ml.png" },
    { name: "Pulsa Telkomsel", publisher: "Telkomsel", link: "/telkomsel", isHot: false, image: "/images/telkomsel.png" },
    { name: "Tagihan PDAM", publisher: "Daerah", link: "/pdam", isHot: false, image: "/images/pdam.png" },
  ];

  const menuTagihan = [
    { name: "PDAM Daerah", publisher: "Daerah", link: "/pdam", image: "/images/pdam.png" },
    { name: "BPJS Kesehatan", publisher: "BPJS Kesehatan", link: "/bpjs-kesehatan", image: "/images/bpjs.jpg" },
    { name: "Pajak PBB", publisher: "Pajak Negara", link: "/pbb", image: "/images/pbb.jpeg" },
    { name: "BPJS Ketenagakerjaan", publisher: "BPJS TK", link: "/bpjs-tk", image: "/images/bpjstk.jpg" },
  ];

  const menuPulsa = [
    { name: "Token PLN", publisher: "PLN Group", link: "/pln", image: "/images/pln.jpg", isHot: true },
    { name: "Telkomsel", publisher: "Telkomsel", link: "/telkomsel", image: "/images/telkomsel.png", isHot: true },
    { name: "Indosat", publisher: "Indosat Ooredoo", link: "/indosat", image: "/images/indosat.jpg" },
    { name: "Axis", publisher: "Axis Telekom", link: "/axis", image: "/images/axis.png" },
    { name: "Smartfren", publisher: "Smartfren", link: "/smartfren", image: "/images/smartfren.png" },
    { name: "Tri", publisher: "Hutchison 3", link: "/tri", image: "/images/tri.jpg" },
    { name: "XL", publisher: "XL Axiata", link: "/xl", image: "/images/XL.jpg" },
    { name: "by.U", publisher: "Telkomsel", link: "/byu", image: "/images/by.u.png" },
  ];

  const menuGames = [
    { name: "Mobile Legends", publisher: "Moonton", link: "/ml", isHot: true, image: "/images/ml.png" },
    { name: "Free Fire", publisher: "Garena", link: "/ff", isHot: true, image: "/images/ff.png" },
    { name: "Valorant", publisher: "Riot Games", link: "/valorant", isHot: true, image: "/images/valo.jpg" },
    { name: "Genshin Impact", publisher: "HoYoverse", link: "/genshin", isHot: true, image: "/images/genshin.jpg" },
    { name: "PUBG Mobile", publisher: "Tencent", link: "/pubgm", isHot: false, image: "/images/pubg.png" },
    { name: "Arena of Valor", publisher: "Garena", link: "/aov", isHot: false, image: "/images/aov.png" },
    { name: "Stumble Guys", publisher: "Scopely", link: "/stumble-guys", isHot: false, image: "/images/SG.png" },
    { name: "Honor of Kings", publisher: "Level Infinite", link: "/hok", isHot: false, image: "/images/hok.png" },
  ];

  const menuVoucher = [
    { name: "Google Play ID", publisher: "Google", link: "/google-play", image: "/images/gplay.png", isHot: true },
    { name: "Garena", publisher: "Garena", link: "/garena-voucher", image: "/images/garena.jpg" },
    { name: "Steam Wallet", publisher: "Valve", link: "/steam", image: "/images/STW.jpg" },
    { name: "Spotify Premium", publisher: "Spotify", link: "/spotify", image: "/images/spotify.png" },
    { name: "Vidio", publisher: "Emtek Group", link: "/vidio", image: "/images/vidio.png" },
    { name: "WeTV", publisher: "Tencent", link: "/wetv", image: "/images/wetv.jpg" },
    { name: "e-Meterai", publisher: "PERURI", link: "/emeterai", image: "/images/EM.png" },
    { name: "Viu", publisher: "PCCW Media", link: "/viu", image: "/images/viu.png" },
  ];

  // Data FAQ
  const faqs = [
    { q: "Apa itu KayanaPay?", a: "KayanaPay adalah platform digital untuk top up game, isi pulsa, beli paket data, bayar tagihan listrik, air, BPJS, dan berbagai kebutuhan digital lainnya. Semua diproses otomatis dan tersedia 24 jam." },
    { q: "Berapa lama proses transaksi?", a: "Hampir semua transaksi diproses secara instan dalam hitungan detik. Untuk beberapa produk tertentu bisa memakan waktu 1-5 menit. Jika lebih dari 10 menit, segera hubungi CS kami." },
    { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima QRIS (gratis), e-wallet (OVO, DANA, ShopeePay, LinkAja), transfer bank via Virtual Account (BCA, BNI, Mandiri, BRI), dan pembayaran di minimarket (Indomaret & Alfamart)." },
    { q: "Apakah transaksi di KayanaPay aman?", a: "Ya, sangat aman. Sistem kami menggunakan enkripsi berlapis untuk melindungi data dan transaksimu. Kami juga tidak menyimpan informasi kartu atau rekening bank." },
  ];

  const filters = [
    { id: "all", label: "Semua" },
    { id: "games", label: "🎮 Games" },
    { id: "voucher", label: "🎟 Voucher" },
    { id: "pulsa", label: "📱 Pulsa & Data" },
    { id: "tagihan", label: "🧾 Tagihan" },
  ];

  return (
    <main className="bg-[#F7F7F5] min-h-screen pb-16 font-sans text-[#111]">
      
      {/* ===== TRUST STRIP ===== */}
      <div className="bg-[#0F6B40] py-[9px] px-7">
        <div className="max-w-[880px] mx-auto flex justify-center gap-8 flex-wrap">
          {["✦ Proses otomatis 24 jam", "✦ Transaksi aman & terenkripsi", "✦ 50.000+ pengguna aktif", "✦ CS siap via WhatsApp"].map(t => (
            <span key={t} className="text-[12px] text-white/85 flex items-center gap-[5px]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ===== SLIDER BANNER (Jika Ada) ===== */}
      {banners.length > 0 && (
        <section className="bg-white border-b border-[#E5E5E3] px-7 py-6">
          <div className="max-w-[880px] mx-auto">
            <div className="relative rounded-[18px] overflow-hidden aspect-[21/8] border border-[#E5E5E3]">
              {banners.map((bn, i) => (
                <Link
                  key={bn.id}
                  href={bn.target_link || "#"}
                  className={`absolute inset-0 transition-opacity duration-1000 ${i === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                >
                  <img src={`http://192.168.100.17:8000${bn.image_url}`} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
                </Link>
              ))}
              {banners.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        height: "6px",
                        width: idx === currentBanner ? "20px" : "6px",
                        background: idx === currentBanner ? "#0F6B40" : "rgba(255,255,255,.6)"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== HERO SECTION ===== */}
      <div className="bg-white border-b border-[#E5E5E3] pt-[52px] pb-[56px] px-7">
        <div className="max-w-[880px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[52px] items-center">
          <div>
            <div className="inline-flex items-center gap-[6px] text-[12px] font-medium text-[#0F6B40] bg-[#EBF5F0] border border-[#BAD9CA] rounded-full px-3 py-1 mb-[18px]">
              <div className="w-[6px] h-[6px] bg-[#0F6B40] rounded-full animate-pulse"></div>
              Platform PPOB Terpercaya
            </div>
            <h1 className="text-[36px] font-bold leading-[1.18] tracking-[-0.7px] text-[#111] mb-[14px]">
              Top up, bayar, dan<br />beli semua digital<br />
              <span className="text-[#0F6B40]">di satu tempat.</span>
            </h1>
            <p className="text-[14px] leading-[1.7] text-[#6B6B67] mb-[26px] max-w-[380px]">
              Game, pulsa, listrik, BPJS — semua bisa dilakukan siapa saja, kapan saja, proses instan.
            </p>
            <div className="flex gap-[10px] mb-[34px]">
              <Link href="#layanan" className="text-[14px] font-medium text-white bg-[#111] border-none rounded-[10px] px-6 py-[11px] cursor-pointer hover:bg-black transition">
                Mulai sekarang
              </Link>
              <Link href="/cek-pesanan" className="text-[14px] font-medium text-[#111] bg-white border border-[#CECCC7] rounded-[10px] px-6 py-[11px] cursor-pointer hover:bg-[#F7F7F5] transition">
                Cek pesanan
              </Link>
            </div>
            <div className="flex gap-7 pt-7 border-t border-[#E5E5E3]">
              {[{ n: "50K+", l: "Pengguna aktif" }, { n: "200+", l: "Jenis produk" }, { n: "99.9%", l: "Transaksi sukses" }].map(s => (
                <div key={s.l}>
                  <div className="text-[22px] font-bold tracking-[-0.5px]">{s.n}</div>
                  <div className="text-[12px] text-[#9B9B97] mt-[2px]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Live Transactions Card */}
          <div className="bg-[#F7F7F5] border border-[#E5E5E3] rounded-[18px] p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9B9B97] mb-[14px] flex justify-between items-center">
              Transaksi terbaru
              <span className="text-[11px] font-semibold text-[#0F6B40] bg-[#EBF5F0] border border-[#BAD9CA] rounded-full px-[10px] py-[2px] flex items-center gap-[5px]">
                <div className="w-[6px] h-[6px] bg-[#0F6B40] rounded-full animate-pulse"></div>Live
              </span>
            </div>
            {[
              { ico: "⚔️", n: "Mobile Legends", s: "86 Diamonds", p: "Rp 19.900" },
              { ico: "⚡", n: "Token PLN", s: "Rp 100.000", p: "Rp 100.500" },
              { ico: "🏥", n: "BPJS Kesehatan", s: "Januari 2026", p: "Rp 150.000" },
              { ico: "📱", n: "Telkomsel 20GB", s: "Paket data", p: "Rp 65.000" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-[10px] py-[10px] border-b border-[#E5E5E3] last:border-none last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E5E3] flex items-center justify-center text-[14px] shrink-0">{r.ico}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{r.n}</div>
                  <div className="text-[11px] text-[#9B9B97]">{r.s}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold">{r.p}</div>
                  <div className="text-[11px] text-[#0F6B40] flex items-center justify-end gap-1 mt-[2px]">
                    <div className="w-[5px] h-[5px] bg-[#0F6B40] rounded-full"></div>Berhasil
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FILTER CHIPS ===== */}
      <div className="bg-white border-b border-[#E5E5E3] px-7" id="layanan">
        <div className="max-w-[880px] mx-auto flex gap-2 py-[14px] overflow-x-auto scrollbar-hide">
          {filters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`inline-flex items-center gap-[6px] px-4 py-[7px] text-[13px] font-medium rounded-full cursor-pointer whitespace-nowrap transition-all duration-150 border ${
                activeTab === c.id
                  ? "text-white bg-[#0F6B40] border-[#0F6B40]"
                  : "text-[#6B6B67] bg-[#F7F7F5] border-[#E5E5E3] hover:text-[#111] hover:border-[#CECCC7]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== FLASH SALE ===== */}
      <FlashSale />

      {/* ===== SHORTCUT LAYANAN ===== */}
      <div className="bg-white border-b border-[#E5E5E3] p-7">
        <div className="max-w-[880px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
            {featuredServices.map(f => (
              <Link key={f.link} href={f.link} className="flex items-center gap-3 p-[14px] px-4 bg-[#F7F7F5] border border-[#E5E5E3] rounded-[14px] cursor-pointer transition-all duration-150 hover:bg-white hover:border-[#CECCC7]">
                <div className="w-[38px] h-[38px] rounded-[9px] bg-white border border-[#E5E5E3] flex items-center justify-center text-[18px] shrink-0">
                  {f.emoji}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#111]">{f.name}</div>
                  <div className="text-[11px] text-[#9B9B97] mt-[2px]">{f.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PRODUK GRID ===== */}
      <div className="bg-[#F7F7F5]">
        {/* SEDANG POPULER (Hanya tampil jika tab 'all') */}
        {activeTab === "all" && (
          <div className="py-8 px-7 border-b border-[#E5E5E3]">
            <div className="max-w-[880px] mx-auto">
              <SectionHeader title="⭐ Sedang Populer" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {menuPopuler.map((item, i) => <ProductCard key={i} item={item} />)}
              </div>
            </div>
          </div>
        )}

        {/* GAMES */}
        {(activeTab === "all" || activeTab === "games") && (
          <div className="py-8 px-7 border-b border-[#E5E5E3]">
            <div className="max-w-[880px] mx-auto">
              <SectionHeader title="🎮 Top Up Games" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {menuGames.map((item, i) => <ProductCard key={i} item={item} />)}
              </div>
            </div>
          </div>
        )}

        {/* VOUCHER */}
        {(activeTab === "all" || activeTab === "voucher") && (
          <div className="py-8 px-7 border-b border-[#E5E5E3]">
            <div className="max-w-[880px] mx-auto">
              <SectionHeader title="🎟 Voucher Digital" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {menuVoucher.map((item, i) => <ProductCard key={i} item={item} />)}
              </div>
            </div>
          </div>
        )}

        {/* PULSA & DATA */}
        {(activeTab === "all" || activeTab === "pulsa") && (
          <div className="py-8 px-7 border-b border-[#E5E5E3]">
            <div className="max-w-[880px] mx-auto">
              <SectionHeader title="📱 Pulsa, Data & PLN" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {menuPulsa.map((item, i) => <ProductCard key={i} item={item} />)}
              </div>
            </div>
          </div>
        )}

        {/* TAGIHAN */}
        {(activeTab === "all" || activeTab === "tagihan") && (
          <div className="py-8 px-7 border-b border-[#E5E5E3]">
            <div className="max-w-[880px] mx-auto">
              <SectionHeader title="🧾 Bayar Tagihan" />
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {menuTagihan.map((item, i) => <ProductCard key={i} item={item} />)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== KENAPA KAYANAPAY ===== */}
      <div className="bg-white border-b border-[#E5E5E3] py-[60px] px-7">
        <div className="max-w-[880px] mx-auto">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0F6B40] mb-3">Kenapa KayanaPay?</div>
          <div className="text-[26px] font-bold tracking-[-0.5px] text-[#111] mb-[10px]">Dirancang untuk semua kalangan</div>
          <p className="text-[14px] text-[#6B6B67] leading-[1.7] max-w-[480px] mb-[44px]">
            Dari pelajar, mahasiswa, ibu rumah tangga, hingga pelaku bisnis — KayanaPay hadir untuk memudahkan transaksi digital sehari-hari.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { ico: "⚡", title: "Proses Instan", desc: "Setiap transaksi diproses otomatis dalam hitungan detik, 24 jam sehari." },
              { ico: "🔒", title: "Aman & Terpercaya", desc: "Sistem keamanan berlapis dengan enkripsi end-to-end. Data terlindungi." },
              { ico: "💰", title: "Harga Termurah", desc: "Kami berkomitmen memberikan harga terbaik untuk semua produk." },
              { ico: "🎮", title: "Produk Terlengkap", desc: "200+ produk dari game, pulsa, tagihan, hingga voucher tersedia." },
              { ico: "🤝", title: "CS Responsif", desc: "Tim customer service siap membantu via WhatsApp kapanpun." },
              { ico: "📱", title: "Mudah Digunakan", desc: "Interface yang bersih dan intuitif — bisa digunakan siapa saja." },
            ].map(w => (
              <div key={w.title} className="p-[22px] bg-[#F7F7F5] border border-[#E5E5E3] rounded-[18px] hover:bg-white hover:border-[#CECCC7] transition-all">
                <div className="text-[28px] mb-[14px]">{w.ico}</div>
                <div className="text-[15px] font-semibold tracking-[-0.2px] mb-2">{w.title}</div>
                <div className="text-[13px] text-[#6B6B67] leading-[1.65]">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== STATS BANNER ===== */}
      <div className="bg-[#111] py-[48px] px-7">
        <div className="max-w-[880px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/10 rounded-[18px] overflow-hidden">
          {[
            { n: "50.000+", l: "Pengguna aktif" },
            { n: "200+", l: "Jenis produk" },
            { n: "99.9%", l: "Tingkat keberhasilan" },
            { n: "24/7", l: "Layanan aktif" },
          ].map((s, i) => (
            <div key={s.l} className="p-[28px_24px] bg-white/5 text-center">
              <div className={`text-[28px] font-bold tracking-[-0.6px] ${i === 0 ? "text-[#0F6B40]" : "text-white"}`}>{s.n}</div>
              <div className="text-[13px] text-white/50 mt-[6px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white border-b border-[#E5E5E3] py-[60px] px-7">
        <div className="max-w-[880px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[48px] items-start">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0F6B40] mb-3">FAQ</div>
            <div className="text-[26px] font-bold tracking-[-0.5px] text-[#111] mb-[10px]">Ada pertanyaan?</div>
            <p className="text-[14px] text-[#6B6B67] leading-[1.7]">
              Temukan jawaban dari pertanyaan yang paling sering ditanyakan. Masih bingung? Hubungi CS kami via WhatsApp.
            </p>
            <div className="mt-6">
              <button className="text-[13px] font-medium text-white bg-[#111] border-none rounded-[10px] px-5 py-[10px] cursor-pointer hover:bg-black transition">
                Hubungi CS →
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            {faqs.map((item, i) => (
              <div key={i} className="border border-[#E5E5E3] rounded-[14px] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className={`flex items-center justify-between p-[14px_18px] w-full text-left text-[14px] font-medium transition-colors border-none cursor-pointer ${openFaq === i ? "bg-[#F7F7F5] text-[#111]" : "bg-white text-[#111] hover:bg-[#F7F7F5]"}`}
                >
                  <span>{item.q}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className={`px-[18px] pb-[14px] text-[13px] text-[#6B6B67] leading-[1.7] bg-[#F7F7F5] ${openFaq === i ? "block" : "hidden"}`}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CTA BANNER ===== */}
      <div className="bg-[#0F6B40] py-[52px] px-7 border-b border-white/10">
        <div className="max-w-[880px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-[24px] font-bold text-white tracking-[-0.4px] mb-2">Mulai transaksi pertamamu sekarang</h2>
            <p className="text-[14px] text-white/75 leading-[1.6]">Daftar gratis, tidak perlu kartu kredit. Proses instan, harga terbaik.</p>
          </div>
          <div className="flex gap-[10px] shrink-0">
            <button className="text-[14px] font-medium text-[#0F6B40] bg-white border-none rounded-[10px] px-6 py-[11px] cursor-pointer hover:bg-gray-100 transition">
              Daftar Gratis
            </button>
            <button className="text-[14px] font-medium text-white bg-white/15 border border-white/30 rounded-[10px] px-6 py-[11px] cursor-pointer hover:bg-white/20 transition">
              Cek Pesanan
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}