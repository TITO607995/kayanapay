"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FlashSale() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch("http://192.168.100.17:8000/api/flash-sales/public", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "success") setItems(data.data);
      } catch (error) {
        console.error("Gagal memuat flash sale:", error);
      }
    };
    fetchFlashSale();
  }, []);

  if (items.length === 0) return null;

  const getBrandLink = (brand) => {
    const b = brand.toUpperCase();
    if (b === "MOBILE LEGENDS") return "/ml";
    if (b === "FREE FIRE") return "/ff";
    if (b === "PUBG MOBILE") return "/pubgm";
    if (b === "VALORANT") return "/valorant";
    if (b === "TOKEN PLN") return "/pln";
    if (b === "TELKOMSEL") return "/telkomsel";
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
                  src={item.image_poster ? `http://192.168.100.17:8000${item.image_poster}` : `https://placehold.co/300x400/F0F7F4/1A7A5E?text=${encodeURIComponent(item.brand)}`}
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