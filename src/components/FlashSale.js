"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function FlashSale() {
  const [items, setItems] = useState([]);

  // 🔥 1. Pisahkan fungsi narik data biar rapi
  const fetchFlashSale = useCallback(async () => {
    try {
      const res = await fetch("https://kayanamart.my.id/api/flash-sales/public", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "success") setItems(data.data);
    } catch (error) {
      console.error("Gagal memuat flash sale:", error);
    }
  }, []);

  // 🔥 2. Pasang Antena Reverb untuk mantau perubahan Flash Sale
  useEffect(() => {
    fetchFlashSale();

    if (typeof window !== 'undefined' && window.Echo) {
      window.Echo.channel('kayana-product-channel')
        .listen('.product.updated', () => {
          // Kalau ada perubahan setting produk/flash sale dari admin, tarik ulang data diam-diam
          fetchFlashSale();
        });
    }

    return () => {
      if (typeof window !== 'undefined' && window.Echo) {
        window.Echo.leaveChannel('kayana-product-channel');
      }
    };
  }, [fetchFlashSale]);

  if (items.length === 0) return null;

  const getBrandLink = (brand) => {
    const b = brand.toUpperCase();

    // ── TOP UP GAMES ──
    if (b === "MOBILE LEGENDS" || b === "MOBILE LEGEND") return "/ml";
    if (b === "FREE FIRE") return "/ff";
    if (b === "MAGIC CHESS") return "/magic-chess";
    if (b === "POINT BLANK") return "/pb";
    if (b === "ARENA OF VALOR" || b === "AOV") return "/aov";
    if (b === "VALORANT") return "/valorant";
    if (b === "PUBG MOBILE" || b === "PUBG") return "/pubgm";
    if (b === "CALL OF DUTY" || b === "CALL OF DUTY MOBILE" || b === "CODM") return "/codm";
    if (b === "LORDS MOBILE") return "/lords-mobile";
    if (b === "GENSHIN IMPACT") return "/genshin";
    if (b === "STUMBLE GUYS") return "/stumble-guys";
    if (b === "FC MOBILE") return "/fc-mobile";
    if (b === "HONOR OF KINGS" || b === "HOK") return "/hok";
    if (b === "BLOOD STRIKE") return "/blood-strike";
    if (b === "DRACONIA SAGA") return "/draconia";
    if (b === "DELTA FORCE") return "/delta-force";

    // ── VOUCHER DIGITAL ──
    if (b === "GOOGLE PLAY ID" || b === "GOOGLE PLAY") return "/google-play";
    if (b === "GARENA") return "/garena-voucher";
    if (b === "STEAM WALLET" || b === "STEAM") return "/steam";
    if (b === "SPOTIFY" || b === "SPOTIFY PREMIUM") return "/spotify";
    if (b === "VIDIO") return "/vidio";
    if (b === "WETV") return "/wetv";
    if (b === "E-METERAI" || b === "EMETERAI") return "/emeterai";
    if (b === "VIU") return "/viu";

    // ── PULSA, DATA & PLN ──
    if (b === "TOKEN PLN" || b === "PLN") return "/pln";
    if (b === "TELKOMSEL") return "/telkomsel";
    if (b === "INDOSAT" || b === "INDOSAT OOREDOO") return "/indosat";
    if (b === "AXIS") return "/axis";
    if (b === "SMARTFREN") return "/smartfren";
    if (b === "TRI" || b === "THREE") return "/tri";
    if (b === "XL" || b === "XL AXIATA") return "/xl";
    if (b === "BY.U" || b === "BYU") return "/byu";

    // ── BAYAR TAGIHAN ──
    if (b === "BPJS KESEHATAN") return "/bpjs-kesehatan";
    if (b === "PDAM DAERAH" || b === "PDAM") return "/pdam";
    if (b === "PAJAK PBB" || b === "PBB") return "/pbb";
    if (b === "BPJS KETENAGAKERJAAN" || b === "BPJS TK") return "/bpjs-tk";

    // Fallback default jika nama brand baru/tidak ada di atas
    return `/${brand.toLowerCase().replace(/ /g, "-")}`;
  };

  // Duplikat items untuk marquee seamless
  const displayItems = items.length > 3 ? [...items, ...items] : items;

  return (
    <div className="bg-white overflow-hidden" style={{ borderBottom: "0.5px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center gap-3">
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          style={{ background: "#FEF2F2", color: "#B91C1C", border: "0.5px solid #FECACA" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
          Flash Deal
        </div>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }}></div>
      </div>

      <div className={`pb-5 px-4 ${items.length > 3 ? "animate-marquee" : "flex gap-3 max-w-6xl mx-auto flex-wrap"}`}>
        {displayItems.map((item, index) => (
          <Link
            key={index}
            href={`${getBrandLink(item.brand)}?sku=${item.sku_code}`}
            className="flex-shrink-0 w-36 group block"
          >
            <div className="rounded-2xl overflow-hidden border transition-all"
              style={{ background: "#fff", borderColor: "var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--teal-border)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div className="aspect-[3/4] relative overflow-hidden" style={{ background: "var(--cream-2)" }}>
                <img
                  src={item.image_poster ? `https://kayanamart.my.id${item.image_poster}` : `https://placehold.co/300x400/F0F7F4/1A7A5E?text=${encodeURIComponent(item.brand)}`}
                  alt={item.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }}></div>
                <div className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: "#FEF2F2", color: "#B91C1C", border: "0.5px solid #FECACA" }}>
                  Diskon
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-tertiary)" }}>{item.brand}</p>
                <p className="text-xs font-semibold truncate mt-0.5" style={{ color: "var(--text-primary)" }}>{item.product_name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                  Rp {Math.round(item.price_sell * 1.15).toLocaleString("id-ID")}
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--teal)" }}>
                  Rp {item.price_sell.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}