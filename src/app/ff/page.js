"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// ── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", icon: "✅" },
    error:   { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: "❌" },
  };
  const s = styles[type] || styles.success;

  return (
    <div
      className="fixed top-5 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all animate-fade-in"
      style={{
        transform: "translateX(-50%)",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        minWidth: "260px",
        maxWidth: "90vw",
      }}
    >
      <span className="text-lg flex-shrink-0">{s.icon}</span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="text-lg leading-none opacity-50 hover:opacity-100 flex-shrink-0">×</button>
    </div>
  );
}

function FreeFireContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const skuFlashSale = searchParams.get("sku");
  const [activeTab, setActiveTab] = useState("transaksi");

  const [selectedDenom, setSelectedDenom] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qty, setQty] = useState(1);
  const [userId, setUserId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Promo states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);

  // 🔥 Member & koin states
  const [memberData, setMemberData] = useState(null);
  const [useKoin, setUseKoin] = useState(false);
  const [isMemberLoading, setIsMemberLoading] = useState(true);

  // 🔥 Toast state
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  // ── Ambil data member ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("kayana_token");
    if (!token) { setIsMemberLoading(false); return; }

    fetch("https://kayanamart.my.id/api/member/dashboard", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success" && d.data?.profil) {
          setMemberData(d.data.profil);
          if (d.data.profil.whatsapp) setWhatsapp(d.data.profil.whatsapp);
        }
      })
      .catch(e => console.error("Gagal ambil data member:", e))
      .finally(() => setIsMemberLoading(false));
  }, []);

  useEffect(() => {
  fetch("https://kayanamart.my.id/api/topup/products?brand=FREE FIRE")
    .then(r => r.json())
    .then(d => { if (d.status === "success") setProducts(d.data); })
    .catch(e => console.error(e))
    .finally(() => setIsLoading(false));

  // 🔥 Langsung set default payment ke QRIS tanpa nembak API (samain kayak ML)
    setSelectedPayment({
      paymentMethod: "QRIS",
      paymentName: "QRIS All Payment",
      totalFee: 0
    });
}, []);

  // Auto-cek nickname
  useEffect(() => {
    if (userId.length >= 5) {
      setIsChecking(true);
      setNickname("");
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://kayanamart.my.id/api/topup/check-ff?userid=${userId}`);
          const data = await res.json();
          setNickname(data.status === "success" ? `✅ Halo, ${data.data.nickname}` : "❌ Nickname tidak ditemukan");
        } catch { setNickname("❌ Gagal mengecek server"); }
        finally { setIsChecking(false); }
      }, 1000);
      return () => clearTimeout(timer);
    } else { setNickname(""); setIsChecking(false); }
  }, [userId]);

  useEffect(() => {
    if (products.length > 0 && skuFlashSale) {
      const target = products.find(p => p.buyer_sku_code === skuFlashSale);
      if (target) {
        setSelectedDenom(target);
        setTimeout(() => document.getElementById("step-nominal")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      }
    }
  }, [products, skuFlashSale]);

  // ── Kalkulasi harga ───────────────────────────────────────────────────────
  const formatRupiah = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const price = selectedDenom ? selectedDenom.price_sell : 0;
  const subtotal = price * qty;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const baseTotal = subtotal + adminFee - discountAmount;

  // Koin: 1 koin = Rp 1
  const koinSaldo = memberData?.koin ?? 0;
  const koinNilaiRupiah = koinSaldo;
  const koinDiskon = useKoin ? Math.min(koinSaldo, Math.max(0, baseTotal)) : 0;
  const koinDigunakan = koinDiskon;

  const finalTotal = Math.max(0, baseTotal - koinDiskon);

  // ── Promo ────────────────────────────────────────────────────────────────
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) { setPromoError("Masukkan kode promo dong!"); return; }
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(`https://kayanamart.my.id/api/promo/check?code=${promoCode.toUpperCase()}`);
      const data = await res.json();
      if (data.status === "success") {
        setAppliedPromo(promoCode.toUpperCase());
        setDiscountAmount(data.data.discount);
        setPromoError("");
        showToast("Promo berhasil dipakai! 🎉", "success");
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError("❌ " + data.message);
      }
    } catch (e) {
      setPromoError("❌ Gagal cek promo, coba lagi ya.");
      console.error(e);
    }
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode("");
    setPromoError("");
  };

  // ── Grup pembayaran ────────────────────────────────────────────────────────
  const groupedPayments = paymentMethods.reduce((acc, pay) => {
    let cat = "Lainnya";
    const name = pay.paymentName.toUpperCase();
    if (name.includes("QRIS")) cat = "QRIS";
    else if (name.includes("VA") || name.includes("VIRTUAL")) cat = "Virtual Account (Transfer Bank)";
    else if (["OVO", "DANA", "SHOPEEPAY", "LINKAJA", "JENIUS"].some(w => name.includes(w))) cat = "E-Wallet";
    else if (name.includes("RETAIL") || name.includes("INDOMARET") || name.includes("ALFAMART")) cat = "Gerai Retail / Minimarket";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pay);
    return acc;
  }, {});

  const categoryIcons = { "QRIS": "🔳", "E-Wallet": "👛", "Virtual Account (Transfer Bank)": "🏦", "Gerai Retail / Minimarket": "🏪", "Lainnya": "💳" };
  const categoryOrder = ["QRIS", "E-Wallet", "Virtual Account (Transfer Bank)", "Gerai Retail / Minimarket", "Lainnya"];

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!userId || !whatsapp) {
      showToast("Harap lengkapi Player ID dan Nomor WhatsApp!", "error");
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const token = localStorage.getItem("kayana_token");
      const res = await fetch("https://kayanamart.my.id/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          target: `${userId}`,
          product_name: selectedDenom.product_name,
          sku_code: selectedDenom.buyer_sku_code,
          price: price * qty,
          admin_fee: adminFee,
          total_amount: finalTotal,
          payment_method: selectedPayment.paymentMethod,
          payment_name: selectedPayment.paymentName,
          whatsapp,
          promo_code: appliedPromo || null,
          discount_amount: discountAmount,
          use_koin: useKoin && koinDigunakan > 0,
          koin_used: koinDigunakan,
        }),
      });
      const d = await res.json();
      if (d.status === "success") {
        window.location.href = `/invoice/${d.data.reference}`;
      } else {
        showToast("Gagal memproses: " + d.message, "error");
      }} catch { showToast("Terjadi kesalahan jaringan.", "error"); }
      setIsCheckoutLoading(false);
    };

  const canCheckout = selectedDenom && selectedPayment && userId && whatsapp && !isCheckoutLoading;

  // ── Ringkasan baris harga ─────────────────────────────────────────────────
  const summaryRows = [
    ["Harga", selectedDenom ? formatRupiah(price) : "-"],
    ["Jumlah Beli", `${qty}x`],
    ["Biaya Admin", selectedPayment ? (adminFee === 0 ? "Gratis" : formatRupiah(adminFee)) : "-"],
    ...(discountAmount > 0 ? [["Diskon Promo", `-${formatRupiah(discountAmount)}`]] : []),
    ...(useKoin && koinDigunakan > 0 ? [[`Koin (${koinDigunakan} koin)`, `-${formatRupiah(koinDiskon)}`]] : []),
  ];

  return (
    <main className="min-h-screen font-sans pb-36 lg:pb-20 bg-slate-50 relative">

      {/* 🔥 Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            <Image src="/images/ff.png" alt="Free Fire" fill className="object-cover" sizes="64px" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Free Fire</h2>
            <p className="text-sm text-slate-500">Garena | Proses Otomatis 1 Detik.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Tab mobile */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 lg:hidden">
              {["transaksi", "keterangan"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm capitalize ${activeTab === tab ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={`space-y-6 ${activeTab === "transaksi" ? "block animate-fade-in" : "hidden lg:block"}`}>

              {/* STEP 1: Player ID */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">1</span>
                  Masukkan Data Akun
                </h3>
                <div className="w-full md:w-2/3">
                  <input type="number" placeholder="Masukkan Player ID" value={userId} onChange={e => setUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div className="h-6 px-1 mt-1">
                  {isChecking && <p className="text-xs text-blue-500 font-bold animate-pulse">⏳ Mencari nickname...</p>}
                  {!isChecking && nickname && (
                    <p className={`text-sm font-bold tracking-wide ${nickname.includes("❌") ? "text-red-500" : "text-blue-600"}`}>{nickname}</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Contoh: 12345678. ID bisa dilihat di menu profil dalam game.</p>
              </div>

              {/* STEP 2: Nominal */}
              <div id="step-nominal" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">2</span>
                  Pilih Nominal Top Up
                </h3>
                {isLoading ? (
                  <div className="text-center py-10"><p className="text-slate-500 animate-pulse font-semibold">Mengambil daftar harga...</p></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.filter(i => !i.product_name.toLowerCase().includes("cek")).sort((a, b) => a.price_sell - b.price_sell).map(item => (
                      <button key={item.buyer_sku_code} onClick={() => setSelectedDenom(item)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-full ${selectedDenom?.buyer_sku_code === item.buyer_sku_code ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:shadow-sm"}`}>
                        <p className="font-bold text-sm text-slate-800">{item.product_name.replace("FREE FIRE - ", "")}</p>
                        <p className="text-xs font-black text-blue-600 mt-1">{formatRupiah(item.price_sell)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 3: Qty */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">3</span>
                  Jumlah Pembelian
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">−</button>
                  <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-inner" />
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">+</button>
                </div>
              </div>

              {/* STEP 4: Pembayaran */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">4</span>
                    Pilih Pembayaran
                  </h3>
                  <button
                    onClick={() => setSelectedPayment({ paymentMethod: "QRIS", paymentName: "QRIS All Payment", totalFee: 0 })}
                    className="w-full p-4 rounded-xl border flex flex-col justify-center transition-all border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-md"
                  >
                    <div className="flex justify-between items-center w-full mb-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-8 object-contain" />
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-blue-600">
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-end w-full">
                      <p className="font-bold text-sm text-slate-800">QRIS All Payment</p>
                      <p className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">Gratis</p>
                    </div>
                  </button>
                </div>

              {/* STEP 5: Kode Promo */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">5</span>
                  Kode Promo <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                </h3>
                {appliedPromo ? (
                  <div className="rounded-xl p-3.5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-blue-700">✓ {appliedPromo}</p>
                        <p className="text-xs mt-1 text-blue-600">Diskon: {formatRupiah(discountAmount)}</p>
                      </div>
                      <button onClick={handleRemovePromo} className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        style={{ background: "#F3E8FF", color: "#7C3AED", border: "0.5px solid #D8B4FE" }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input type="text" placeholder="Masukkan kode promo" value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition uppercase" />
                    <button type="submit" disabled={promoLoading || !promoCode.trim()}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md disabled:opacity-50">
                      {promoLoading ? "Cek..." : "Pakai"}
                    </button>
                  </form>
                )}
                {promoError && <p className="text-xs font-medium text-red-600 mt-2">{promoError}</p>}
              </div>

              {/* 🔥 STEP 6: Koin KayanaPay — hanya kalau login */}
              {!isMemberLoading && memberData && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">6</span>
                    Koin KayanaPay <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                  </h3>
                  <div
                    onClick={() => setUseKoin(v => !v)}
                    className="rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all"
                    style={{
                      background: useKoin ? "#F5F3FF" : "#F8FAFC",
                      border: `1px solid ${useKoin ? "#A78BFA" : "#E2E8F0"}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: useKoin ? "#EDE9FE" : "#F1F5F9", border: `1px solid ${useKoin ? "#C4B5FD" : "#E2E8F0"}` }}>
                        🪙
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: useKoin ? "#7C3AED" : "#1E293B" }}>
                          {koinSaldo.toLocaleString("id-ID")} Koin
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: useKoin ? "#6D28D9" : "#94A3B8" }}>
                          Setara {formatRupiah(koinNilaiRupiah)}
                          {useKoin && koinDigunakan > 0 && (
                            <span className="ml-1 font-bold" style={{ color: "#7C3AED" }}>→ hemat {formatRupiah(koinDiskon)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {/* Toggle */}
                    <div className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all"
                      style={{ background: useKoin ? "#7C3AED" : "#E2E8F0" }}>
                      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                        style={{ left: useKoin ? "calc(100% - 1.375rem)" : "0.125rem" }} />
                    </div>
                  </div>
                  {useKoin && koinDigunakan === 0 && selectedDenom && (
                    <p className="text-xs mt-2 text-slate-400">ℹ️ Saldo koin sudah terpakai maksimal oleh diskon lain.</p>
                  )}
                  {useKoin && !selectedDenom && (
                    <p className="text-xs mt-2 text-slate-400">ℹ️ Pilih nominal dulu untuk melihat potongan koin.</p>
                  )}
                </div>
              )}

              {/* STEP 6/7: WhatsApp */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">
                    {memberData ? "7" : "6"}
                  </span>
                  Detail Kontak
                </h3>
                <div className="relative">
                  <input type="number" placeholder="Nomor WhatsApp (08...)" value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  {memberData && memberData.whatsapp === whatsapp && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-0.5 rounded-full pointer-events-none"
                      style={{ background: "#EFF6FF", color: "#059669", border: "0.5px solid #A7F3D0" }}>
                      ✓ Dari profil
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Bukti pembelian akan dikirimkan melalui WhatsApp.</p>
              </div>

            </div>

            {/* Keterangan mobile */}
            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
              <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 uppercase">Deskripsi Free Fire</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Top up diamond Free Fire (FF) harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY.
              </p>
              <h4 className="text-slate-800 font-bold text-sm mb-3">Cara Top Up FF :</h4>
              <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                {["Pilih tab Transaksi.", "Masukkan Data Akun (Player ID).", "Pilih Nominal Diamond.", "Tentukan Jumlah Pembelian.", "Pilih Metode Pembayaran.", "Masukkan Kode Promo (jika ada).", "Isi Detail Kontak (WhatsApp aktif).", "Klik Pesan Sekarang dan selesaikan Pembayaran.", "Diamond otomatis masuk ke akun Anda."].map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Kolom kanan desktop */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <div className="space-y-6 h-full">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 uppercase">Deskripsi Free Fire</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Top up diamond Free Fire (FF) harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY.
                </p>
                <h4 className="text-slate-800 font-bold text-sm mb-3">Cara Top Up FF :</h4>
                <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                  {["Masukkan Data Akun (Player ID).", "Pilih Nominal Diamond.", "Tentukan Jumlah Pembelian.", "Pilih Metode Pembayaran.", "Masukkan Kode Promo (jika ada).", "Isi Detail Kontak (WhatsApp aktif).", "Klik Bayar Sekarang dan selesaikan Pembayaran.", "Diamond otomatis masuk ke akun Anda."].map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>

              {/* Ringkasan sticky */}
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4">Rincian Pesanan</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 overflow-hidden flex-shrink-0">
                    <Image src="/images/ff.png" alt="Free Fire" fill className="object-cover" sizes="56px" />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm">Free Fire</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {selectedDenom ? selectedDenom.product_name.replace("FREE FIRE - ", "") : "Belum memilih nominal"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {summaryRows.map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className={`font-bold ${label.startsWith("Koin") ? "text-purple-600" : label.startsWith("Diskon") ? "text-blue-600" : "text-slate-800"}`}>{val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-6 pt-2">
                  <span className="text-slate-800 font-bold">Total Bayar</span>
                  <span className="text-blue-600 font-black text-xl">{selectedDenom ? formatRupiah(finalTotal) : "-"}</span>
                </div>
                <button onClick={handleCheckout} disabled={!canCheckout}
                  className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${canCheckout ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}>
                  {isCheckoutLoading ? <span className="animate-pulse">Memproses...</span> : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      Bayar Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 lg:hidden rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-3">
        {!selectedDenom ? (
          <div className="text-center text-sm font-medium text-slate-500 py-2">Belum ada item produk yang dipilih.</div>
        ) : (
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-xl font-black text-blue-600">{formatRupiah(finalTotal)}</span>
          </div>
        )}
        <button onClick={handleCheckout} disabled={!canCheckout}
          className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${canCheckout ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"}`}>
          {isCheckoutLoading ? "Memproses..." : "Pesan Sekarang!"}
        </button>
      </div>

    </main>
  );
}

export default function FreeFire() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm animate-pulse text-blue-600">Menyiapkan halaman...</p>
      </div>
    }>
      <FreeFireContent />
    </Suspense>
  );
}