"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FlashSale from "@/components/FlashSale";

const ProductCard = ({ item }) => (
  <Link href={item.link} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white aspect-[4/5] border border-slate-200 hover:border-blue-500 block">
    <div className="absolute inset-0 bg-slate-100">
      <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.src = 'https://placehold.co/400x500/eff6ff/1d4ed8?text=' + item.name.replace(' ', '+') }}/>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
    {item.isHot && (
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-md tracking-widest z-10 border border-blue-400">HOT</div>
    )}
    <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 z-10 overflow-hidden">
      <div className="transform translate-y-5 group-hover:translate-y-0 transition-transform duration-300 ease-out">
        <h3 className="text-white font-black text-sm md:text-base leading-tight mb-1 text-shadow line-clamp-1">{item.name}</h3>
        <p className="text-sky-300 text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.publisher}</p>
      </div>
    </div>
  </Link>
);

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0); // 🔥 State untuk Slider
  
  // 1. Ambil Data Banner
  useEffect(() => {
    const fetchLiveBanners = async () => {
      try {
        const res = await fetch("http://192.168.1.9:8000/api/banners");
        const data = await res.json();
        if (data.status === "success") {
          setBanners(data.data);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi banner dapur:", error);
      }
    };
    fetchLiveBanners();
  }, []);

  // 2. Logika Auto-Slide Banner Berputar (Tiap 4 Detik)
  useEffect(() => {
    if (banners.length <= 1) return; // Kalau banner cuma 1, nggak usah muter

    const slideInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [banners.length]);

  const menuPopuler = [
    { name: "Mobile Legends", publisher: "Moonton", link: "/ml", isHot: true, image: "https://placehold.co/400x500/1d4ed8/ffffff?text=MLBB" },
    { name: "Free Fire", publisher: "Garena", link: "/ff", isHot: true, image: "https://placehold.co/400x500/0369a1/ffffff?text=Free+Fire" },
    { name: "Pulsa Telkomsel", publisher: "Telkomsel", link: "/pulsa", isHot: false, image: "https://placehold.co/400x500/ef4444/ffffff?text=Telkomsel" },
    { name: "Token PLN", publisher: "PLN Group", link: "/pln", isHot: false, image: "https://placehold.co/400x500/fbbf24/1e293b?text=PLN" },
    { name: "Tagihan PDAM", publisher: "Daerah", link: "/pdam", isHot: false, image: "https://placehold.co/400x500/3b82f6/ffffff?text=PDAM" },
  ];

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

  const menuPulsa = [
    { name: "Token PLN", publisher: "PLN Group", link: "/pln", image: "/images/pln.jpg" },
    { name: "Telkomsel", publisher: "Telkomsel", link: "/telkomsel", image: "/images/telkomsel.png" },
    { name: "Indosat", publisher: "Indosat Ooredoo", link: "/indosat", image: "/images/indosat.jpg" },
    { name: "Axis", publisher: "Axis Telekom", link: "/axis", image: "/images/axis.png" },
    { name: "Smartfren", publisher: "Smartfren", link: "/smartfren", image: "/images/smartfren.png" },
    { name: "Tri", publisher: "Hutchison 3", link: "/tri", image: "/images/tri.jpg" },
    { name: "XL", publisher: "XL Axiata", link: "/xl", image: "/images/XL.jpg" },
    { name: "by.U", publisher: "Telkomsel", link: "/byu", image: "/images/by.u.png" },
  ];

  const menuVoucher = [
    { name: "Google Play ID", publisher: "Google", link: "/google-play", image: "/images/gplay.png" },
    { name: "Garena", publisher: "Garena", link: "/garena-voucher", image: "/images/garena.jpg" },
    { name: "Steam Wallet", publisher: "Valve", link: "/steam", image: "/images/STW.jpg" },
    { name: "Spotify", publisher: "Spotify", link: "/spotify", image: "/images/spotify.png" },
    { name: "Vidio", publisher: "Emtek Group", link: "/vidio", image: "/images/vidio.png" },
    { name: "WeTV", publisher: "Tencent", link: "/wetv", image: "/images/wetv.jpg" },
    { name: "e-Meterai", publisher: "PERURI", link: "/emeterai", image: "/images/EM.png" },
    { name: "Viu", publisher: "PCCW Media", link: "/viu", image: "/images/viu.png" },
  ];

  const menuTagihan = [
    { name: "PDAM Daerah", publisher: "Daerah", link: "/pdam", image: "/images/pdam.png" },
    { name: "BPJS Kesehatan", publisher: "BPJS Kesehatan", link: "/bpjs-kesehatan", image: "/images/bpjs.jpg" },
    { name: "Pajak PBB", publisher: "Pajak Negara", link: "/pbb", image: "/images/pbb.jpeg" },
    { name: "BPJS Ketenagaker", publisher: "BPJS Ketenagakerjaan", link: "/bpjs-tk", image: "/images/bpjstk.jpg" },
  ];

  return (
    <main className="min-h-screen font-sans pb-20 bg-slate-50 relative">
      
      {/* ==========================================
          --- HERO SECTION (SLIDER DINAMIS) ---
          ========================================== */}
      {banners.length > 0 && (
        <section className="bg-white pt-12 pb-14 border-b border-slate-200 relative">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-slate-100 aspect-[21/9] md:aspect-[3/1]">
              
              {banners.map((bn, index) => (
                <Link 
                  key={bn.id} 
                  href={bn.target_link || "#"}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img 
                    src={`http://192.168.1.9:8000${bn.image_url}`} 
                    alt={`Promo Banner ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}

              {/* Titik Indikator Slider (Muncul kalau banner > 1) */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentBanner ? 'bg-blue-600 w-6' : 'bg-white/80 w-2 hover:bg-white'}`}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      <FlashSale />

      {/* ==========================================
          --- KATEGORI PRODUK ---
          ========================================== */}
      <div id="kategori" className="container mx-auto px-4 max-w-6xl space-y-16 mt-12 relative z-20 scroll-mt-24">
        
        {/* 1. SEDANG POPULER */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white text-blue-600 border border-slate-200 shadow-sm flex items-center justify-center rounded-xl text-2xl">🔥</div>
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Sedang Populer</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {menuPopuler.map((item, index) => <ProductCard key={`populer-${index}`} item={item} />)}
          </div>
        </section>

        {/* 2. GAMES */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white text-blue-600 border border-slate-200 shadow-sm flex items-center justify-center rounded-xl text-2xl">🎮</div>
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Top Up Games</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {menuGames.map((item, index) => <ProductCard key={`games-${index}`} item={item} />)}
          </div>
        </section>

        {/* 3. PULSA, DATA & PLN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white text-blue-600 border border-slate-200 shadow-sm flex items-center justify-center rounded-xl text-2xl">📱</div>
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Pulsa, Data & PLN</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {menuPulsa.map((item, index) => <ProductCard key={`pulsa-${index}`} item={item} />)}
          </div>
        </section>

        {/* 4. VOUCHER DIGITAL */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white text-blue-600 border border-slate-200 shadow-sm flex items-center justify-center rounded-xl text-2xl">🎟️</div>
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Voucher Digital</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {menuVoucher.map((item, index) => <ProductCard key={`voucher-${index}`} item={item} />)}
          </div>
        </section>

        {/* 5. TAGIHAN */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white text-blue-600 border border-slate-200 shadow-sm flex items-center justify-center rounded-xl text-2xl">🧾</div>
            <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">Bayar Tagihan</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {menuTagihan.map((item, index) => <ProductCard key={`tagihan-${index}`} item={item} />)}
          </div>
        </section>

      </div>
    </main>
  );
}