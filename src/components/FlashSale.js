"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FlashSale() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch("http://192.168.1.7:8000/api/flash-sales/public", {
            headers: { "Accept": "application/json" }
        });
        
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === "success") {
            setItems(data.data);
        }
      } catch (error) {
        console.error("Gagal memuat data flash sale:", error);
      }
    };
    fetchFlashSale();
  }, []);

  if (items.length === 0) return null;

  // 🔥 KAMUS PINTAR: Ngarahin nama Brand dari Digiflazz ke nama Folder Next.js lu 🔥
  const getBrandLink = (brand) => {
    const b = brand.toUpperCase();
    if (b === "MOBILE LEGENDS") return "/ml";
    if (b === "FREE FIRE") return "/ff";
    if (b === "PUBG MOBILE") return "/pubgm";
    if (b === "VALORANT") return "/valorant";
    if (b === "TOKEN PLN") return "/pln";
    if (b === "TELKOMSEL") return "/pulsa"; 
    // Default kalau belum ada di kamus:
    return `/${brand.toLowerCase().replace(/ /g, '-')}`;
  };

  return (
    <div className="py-10 bg-white overflow-hidden relative z-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center gap-3">
        <div className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-black italic tracking-tighter animate-pulse shadow-md shadow-red-500/30">
          FLASH DEAL 🔥
        </div>
        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 animate-pulse" style={{width: '30%'}}></div>
        </div>
      </div>

      <div className={`flex gap-4 px-4 ${items.length > 4 ? 'animate-marquee hover:pause' : 'justify-center max-w-7xl mx-auto flex-wrap'}`}>
        {items.map((item, index) => (
          <Link 
            key={index} 
            // 🔥 OBAT 404: Link sekarang ngelewatin kamus pintar di atas 🔥
            href={`${getBrandLink(item.brand)}?sku=${item.sku_code}`}
            className="flex-shrink-0 w-44 md:w-56 group relative"
          >
            <div className="bg-slate-900 rounded-3xl overflow-hidden aspect-[3/4] relative border-2 border-transparent group-hover:border-red-500 transition-all shadow-xl">
              
              <img 
                src={item.image_poster ? `http://192.168.1.7:8000${item.image_poster}` : `https://placehold.co/400x600/1e293b/ef4444?text=${item.sku_code}`} 
                alt={item.product_name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

              <div className="absolute bottom-0 left-0 w-full p-4">
                <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-widest">{item.brand}</p>
                <h4 className="text-white font-bold text-xs md:text-sm truncate mb-2">{item.product_name}</h4>
                
                <div className="flex flex-col">
                  {/* 🔥 OBAT KOMA: Pake Math.round biar bulat sempurna 🔥 */}
                  <span className="text-slate-400 text-[10px] md:text-xs line-through">
                    Rp {Math.round(item.price_sell * 1.15).toLocaleString("id-ID")}
                  </span>
                  <span className="text-white font-black text-sm md:text-lg text-shadow">
                    Rp {item.price_sell.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg border border-red-400">
                DISC 🔥
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * ${items.length})); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee ${items.length * 3}s linear infinite; 
        }
        .pause { animation-play-state: paused; }
      `}</style>
    </div>
  );
}