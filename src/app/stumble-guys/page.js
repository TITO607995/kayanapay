"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react"; // Tambah Suspense
import { useSearchParams } from "next/navigation"; // Tambah useSearchParams
import Image from "next/image";

function StumbleGuys() {
  const searchParams = useSearchParams(); // Ambil search params
  const skuFlashSale = searchParams.get("sku");
  const [activeTab, setActiveTab] = useState("transaksi"); 


  const [selectedDenom, setSelectedDenom] = useState(null); 
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qty, setQty] = useState(1); 
  const [userId, setUserId] = useState(""); 
  const [whatsapp, setWhatsapp] = useState("");
  
  
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [memberData, setMemberData] = useState(null); // { name, whatsapp, koin }
  const [useKoin, setUseKoin] = useState(false);
  const [isMemberLoading, setIsMemberLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kayana_token");
    if (!token) {
      setIsMemberLoading(false);
      return;
    }

    fetch("https://kayanamart.my.id/api/member/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success" && d.data?.profil) {
          setMemberData(d.data.profil);

          // auto-fill whatsapp dari profil
          if (d.data.profil.whatsapp) {
            setWhatsapp(d.data.profil.whatsapp);
          }
        }
      })
      .catch((e) => console.error("Gagal ambil data member:", e))
      .finally(() => setIsMemberLoading(false));
  }, []);

  useEffect(() => {
    fetch("https://kayanamart.my.id/api/topup/products?brand=STUMBLE GUYS")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setProducts(data.data);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Gagal narik data:", error);
        setIsLoading(false);
      });

    fetch("https://kayanamart.my.id/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPaymentMethods(data.data);
        }
      })
      .catch((error) => console.error("Gagal narik payment:", error));
  }, []);

  useEffect(() => {
    // Jalankan logika hanya jika data produk sudah ada dan ada SKU di URL
    if (products.length > 0 && skuFlashSale) {
      // Cari produk yang buyer_sku_code-nya sama dengan SKU dari URL
      const targetProduct = products.find(p => p.buyer_sku_code === skuFlashSale);
      
      if (targetProduct) {
        // Set produk tersebut sebagai produk yang dipilih
        setSelectedDenom(targetProduct);
        console.log("Berhasil auto-select produk flash sale:", targetProduct.product_name);
        
        
        setTimeout(() => {
          document.getElementById('step-nominal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }, 100);
      }
    }
  }, [products, skuFlashSale]);

  const handleApplyPromo = async (e) => {
    e.preventDefault();

    if (!promoCode.trim()) {
      setPromoError("Masukkan kode promo dulu.");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const res = await fetch(
        `https://kayanamart.my.id/api/promo/check?code=${promoCode.toUpperCase()}`
      );
      const data = await res.json();

      if (data.status === "success") {
        setAppliedPromo(promoCode.toUpperCase());
        setDiscountAmount(data.data.discount);
        setPromoError("");
        alert("✅ Promo berhasil dipakai!");
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError("❌ " + data.message);
      }
    } catch (error) {
      setPromoError("❌ Gagal cek promo, coba lagi.");
      console.error(error);
    }

    setPromoLoading(false);
  };

  // TAMBAH FUNGSI HAPUS PROMO
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode("");
    setPromoError("");
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const price = selectedDenom ? selectedDenom.price_sell : 0;
  const subtotal = price * qty;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const baseTotal = subtotal + adminFee - discountAmount;

  // 1 koin = Rp 1
  const koinSaldo = memberData?.koin ?? 0;
  const koinNilaiRupiah = koinSaldo;
  const koinDiskon = useKoin ? Math.min(koinSaldo, Math.max(0, baseTotal)) : 0;
  const koinDigunakan = koinDiskon;

  const finalTotal = Math.max(0, baseTotal - koinDiskon);

  
  const groupedPayments = paymentMethods.reduce((acc, pay) => {
    let category = "Lainnya";
    const name = pay.paymentName.toUpperCase();

    if (name.includes("QRIS")) category = "QRIS";
    else if (name.includes("VA") || name.includes("VIRTUAL")) category = "Virtual Account (Transfer Bank)";
    else if (["OVO", "DANA", "SHOPEEPAY", "LINKAJA", "JENIUS"].some(w => name.includes(w))) category = "E-Wallet";
    else if (name.includes("RETAIL") || name.includes("INDOMARET") || name.includes("ALFAMART")) category = "Gerai Retail / Minimarket";

    if (!acc[category]) acc[category] = [];
    acc[category].push(pay);
    return acc;
  }, {});

  const categoryIcons = {
    "QRIS": "🔳",
    "E-Wallet": "👛",
    "Virtual Account (Transfer Bank)": "🏦",
    "Gerai Retail / Minimarket": "🏪",
    "Lainnya": "💳"
  };

  const categoryOrder = ["QRIS", "E-Wallet", "Virtual Account (Transfer Bank)", "Gerai Retail / Minimarket", "Lainnya"];

  // FUNGSI CHECKOUT
  const handleCheckout = async () => {
    if (!userId || !whatsapp) {
      alert("Harap lengkapi User ID dan Nomor WhatsApp!");
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const token = localStorage.getItem("kayana_token");

      const response = await fetch(
        "https://kayanamart.my.id/api/payment/checkout",
        {
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
            whatsapp: whatsapp,
            promo_code: appliedPromo || null,
            discount_amount: discountAmount,
            use_koin: useKoin && koinDigunakan > 0,
            koin_used: koinDigunakan,
          }),
      });

      const resData = await response.json();

      if (resData.status === "success") {
        window.location.href = resData.data.paymentUrl; 
      } else {
        alert("Gagal memproses pembayaran: " + resData.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      console.error(error);
    }
    
    setIsCheckoutLoading(false);
  };

  return (
    <main className="min-h-screen font-sans pb-36 lg:pb-20 bg-slate-50 relative">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Banner Game */}
        <div className="flex items-center gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 overflow-hidden flex-shrink-0">
              <Image 
              src="/images/SG.png" 
              alt="Stumble Guys" 
              fill 
              className="object-cover" 
              sizes="56px"
              />
        </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Stumble Guys</h2>
            <p className="text-sm text-slate-500">SCOPELY | Proses Otomatis 1 Detik.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 lg:hidden">
              <button 
                onClick={() => setActiveTab("transaksi")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${
                  activeTab === "transaksi" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Transaksi
              </button>
              <button 
                onClick={() => setActiveTab("keterangan")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${
                  activeTab === "keterangan" 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Keterangan
              </button>
            </div>


            <div className={`space-y-6 ${activeTab === "transaksi" ? "block animate-fade-in" : "hidden lg:block"}`}>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">1</span> 
                  Masukkan Data Akun
                </h3>
                <div className="w-full md:w-2/3">
                  <input 
                    type="text" 
                    placeholder="Masukkan Player ID" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                  />
                </div>
              </div>

              <div id="step-nominal" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">2</span> 
                  Pilih Nominal Top Up
                </h3>
                {isLoading ? (
                  <div className="text-center py-10"><p className="text-slate-500 animate-pulse font-semibold">Mengambil daftar harga...</p></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products
                      .sort((a, b) => a.price_sell - b.price_sell)
                      .map((item) => (
                      <button 
                        key={item.buyer_sku_code}
                        onClick={() => setSelectedDenom(item)}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-full ${
                          selectedDenom?.buyer_sku_code === item.buyer_sku_code 
                          ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-md" 
                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-bold text-sm text-slate-800">{item.product_name.replace("STUMBLE GUYS - ", "")}</p>
                        <p className="text-xs font-black text-emerald-600 mt-1">{formatRupiah(item.price_sell)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">3</span> 
                  Jumlah Pembelian
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">-</button>
                  <input type="number" value={qty} onChange={(e) => setQty(e.target.value > 0 ? parseInt(e.target.value) : 1)} className="w-20 text-center bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-inner" />
                  <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">+</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">4</span> 
                  Pilih Pembayaran
                </h3>
                {paymentMethods.length === 0 && !isLoading ? (
                  <p className="text-sm text-red-500 font-medium">Metode pembayaran sedang tidak tersedia.</p>
                ) : (
                  <div className="space-y-6">

                    {groupedPayments["QRIS"] && groupedPayments["QRIS"].length > 0 && (
                      <div>
                        <div className="grid grid-cols-1 gap-3">
                          {groupedPayments["QRIS"].map((pay) => {
                            const displayName = "QRIS All Payment";
                            const displayImage = "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg";
                            return (
                              <button 
                                key={pay.paymentMethod}
                                onClick={() => setSelectedPayment(pay)}
                                className={`w-full p-4 rounded-xl border flex flex-col justify-center transition-all ${
                                  selectedPayment?.paymentMethod === pay.paymentMethod 
                                  ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 shadow-md" 
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full mb-3">
                                  <div className="h-8 flex items-center justify-start">
                                    <img src={displayImage} alt={displayName} className="h-full object-contain" />
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-emerald-600' : 'border-slate-300'}`}>
                                    {selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>}
                                  </div>
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <p className="font-bold text-sm text-slate-800 text-left">{displayName}</p>
                                  <p className="text-xs font-black text-emerald-600 bg-blue-100 px-2 py-1 rounded-md">
                                    {pay.totalFee == 0 ? "Gratis" : `+ ${formatRupiah(pay.totalFee)}`}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {categoryOrder.filter(cat => cat !== "QRIS").map((category) => {
                        const methods = groupedPayments[category];
                        if (!methods || methods.length === 0) return null; 
                        const isOpen = openCategory === category;
                        
                        return (
                          <div key={category} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-300 shadow-sm' : 'border-slate-200'}`}>
                            <button 
                              onClick={() => setOpenCategory(isOpen ? null : category)}
                              className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{categoryIcons[category]}</span>
                                <span className={`font-bold ${isOpen ? 'text-emerald-600' : 'text-slate-700'}`}>{category}</span>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isOpen && (
                              <div className="p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-blue-100">
                                {methods.map((pay) => (
                                  <button 
                                    key={pay.paymentMethod}
                                    onClick={() => setSelectedPayment(pay)}
                                    className={`w-full p-3 rounded-xl border flex flex-col justify-center transition-all ${
                                      selectedPayment?.paymentMethod === pay.paymentMethod 
                                      ? "border-emerald-500 bg-white ring-1 ring-emerald-500 shadow-md" 
                                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full mb-2">
                                      <div className="h-6 flex items-center justify-start">
                                        <img src={pay.paymentImage} alt={pay.paymentName} className="h-full object-contain" />
                                      </div>
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-emerald-500' : 'border-slate-300'}`}>
                                        {selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-end w-full mt-1">
                                      <p className="font-bold text-xs text-slate-700 text-left line-clamp-1">{pay.paymentName}</p>
                                      <p className="text-[11px] font-black text-emerald-500 whitespace-nowrap">
                                        {pay.totalFee == 0 ? "Gratis" : `+ ${formatRupiah(pay.totalFee)}`}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">5</span>
                  Kode Promo <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                </h3>

                {appliedPromo ? (
                  <div className="rounded-xl p-3.5" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-emerald-700">✓ {appliedPromo}</p>
                        <p className="text-xs mt-1 text-emerald-600">
                          Diskon: {formatRupiah(discountAmount)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        style={{ background: "#F3E8FF", color: "#7C3AED", border: "0.5px solid #D8B4FE" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition uppercase"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md disabled:opacity-50"
                    >
                      {promoLoading ? "Cek..." : "Pakai"}
                    </button>
                  </form>
                )}

                {promoError && (
                  <p className="text-xs font-medium text-red-600 mt-2">
                    {promoError}
                  </p>
                )}
              </div>

              {!isMemberLoading && memberData && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">6</span>
                  Koin KayanaPay <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                </h3>

                <div
                  className="rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-all"
                  onClick={() => setUseKoin((v) => !v)}
                  style={{
                    background: useKoin ? "#F5F3FF" : "var(--cream-2)",
                    border: `0.5px solid ${useKoin ? "#A78BFA" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: useKoin ? "#EDE9FE" : "var(--cream-3)",
                        border: `0.5px solid ${useKoin ? "#C4B5FD" : "var(--border)"}`,
                      }}
                    >
                      🪙
                    </div>

                    <div>
                      <p className="text-sm font-semibold" style={{ color: useKoin ? "#7C3AED" : "var(--text-primary)" }}>
                        {koinSaldo.toLocaleString("id-ID")} Koin
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: useKoin ? "#6D28D9" : "var(--text-tertiary)" }}>
                        Setara {formatRupiah(koinNilaiRupiah)}
                        {useKoin && koinDigunakan > 0 && (
                          <span className="ml-1 font-semibold" style={{ color: "#7C3AED" }}>
                            → hemat {formatRupiah(koinDiskon)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div
                    className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all"
                    style={{
                      background: useKoin ? "#7C3AED" : "var(--cream-3)",
                      border: `0.5px solid ${useKoin ? "#7C3AED" : "var(--border)"}`,
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
                      style={{ left: useKoin ? "calc(100% - 1.375rem)" : "0.125rem" }}
                    />
                  </div>
                </div>

                {useKoin && koinDigunakan === 0 && selectedDenom && (
                  <p className="text-xs mt-2 pl-1" style={{ color: "var(--text-tertiary)" }}>
                    ℹ️ Saldo koin sudah terpakai maksimal oleh diskon lain.
                  </p>
                )}

                {!selectedDenom && useKoin && (
                  <p className="text-xs mt-2 pl-1" style={{ color: "var(--text-tertiary)" }}>
                    ℹ️ Pilih nominal dulu untuk melihat potongan koin.
                  </p>
                )}
              </div>
            )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">6</span> 
                  Detail Kontak
                </h3>
                <input 
                  type="number" 
                  placeholder="Nomor WhatsApp (08...)" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                />
                <p className="text-xs text-slate-400 mt-2">Bukti pembelian akan dikirimkan melalui WhatsApp.</p>
              </div>

            </div>

            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
              <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">
                Deskripsi Stumble Guys
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Top up Stumble Guys Cash harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY. 
              </p>
              
              <h4 className="text-slate-800 font-bold text-sm mb-3">Cara Top Up :</h4>
              <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                <li>Pilih tab <b>Transaksi</b>.</li>
                <li>Masukkan Player ID Anda.</li>
                <li>Pilih Nominal yang diinginkan.</li>
                <li>Tentukan Jumlah Pembelian.</li>
                <li>Pilih Metode Pembayaran.</li>
                <li>Masukkan Kode Promo (jika ada).</li>
                <li>Isi Detail Kontak (WhatsApp aktif).</li>
                <li>Klik <b>Pesan Sekarang</b> dan lakukan Pembayaran.</li>
              </ol>
            </div>

          </div>

          <div className="hidden lg:block lg:col-span-1 relative">
            <div className="space-y-6 h-full">

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">
                  Deskripsi Stumble Guys
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Top up Stumble Guys Cash harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY. 
                </p>
                
                <h4 className="text-slate-800 font-bold text-sm mb-3">Cara Top Up :</h4>
                <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                  <li>Masukkan ID Anda.</li>
                  <li>Pilih Nominal yang diinginkan.</li>
                  <li>Tentukan Jumlah Pembelian.</li>
                  <li>Pilih Metode Pembayaran.</li>
                  <li>Masukkan Kode Promo (jika ada).</li>
                  <li>Isi Detail Kontak (WhatsApp aktif).</li>
                  <li>Klik <b>Bayar Sekarang</b> dan selesaikan Pembayaran.</li>
                </ol>
              </div>

              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4">Rincian Pesanan</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 overflow-hidden flex-shrink-0">
                      <Image 
                      src="/images/SG.png" 
                      alt="Stumble Guys" 
                      fill 
                      className="object-cover" 
                      sizes="56px"
                      />
                </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm">Stumble Guys</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {selectedDenom ? selectedDenom.product_name.replace("STUMBLE GUYS - ", "") : "Belum memilih nominal"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Harga</span>
                    <span className="text-slate-800 font-bold">{selectedDenom ? formatRupiah(price) : "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Jumlah Beli</span>
                    <span className="text-slate-800 font-bold">{qty}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Biaya Admin</span>
                    <span className="text-slate-800 font-bold">{selectedPayment ? formatRupiah(adminFee) : "-"}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Diskon Promo</span>
                      <span className="text-emerald-600 font-bold">-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6 pt-2">
                  <span className="text-slate-800 font-bold">Total Bayar</span>
                  <span className="text-emerald-600 font-black text-xl">
                    {selectedDenom ? formatRupiah(finalTotal) : "-"}
                  </span>
                </div>

                {/* Tombol Beli (Desktop) */}
                <button 
                  onClick={handleCheckout}
                  className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    selectedDenom && selectedPayment && userId && whatsapp && !isCheckoutLoading
                    ? "bg-emerald-600 hover:bg-blue-700 text-white shadow-emerald-600/30 cursor-pointer" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                  disabled={!selectedDenom || !selectedPayment || !userId || !whatsapp || isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <span className="animate-pulse">Memproses...</span>
                  ) : (
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

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 lg:hidden rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-3 transition-transform">
        {!selectedDenom ? (
          <div className="text-center text-sm font-medium text-slate-500 py-2">
            Belum ada item produk yang dipilih.
          </div>
        ) : (
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-xl font-black text-emerald-600">{formatRupiah(finalTotal)}</span>
          </div>
        )}
        
        <button
          onClick={handleCheckout}
          disabled={!selectedDenom || !selectedPayment || !userId || !whatsapp || isCheckoutLoading}
          className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${
            selectedDenom && selectedPayment && userId && whatsapp && !isCheckoutLoading
            ? "bg-emerald-600 hover:bg-blue-700 text-white shadow-lg shadow-emerald-600/30"
            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isCheckoutLoading ? "Memproses..." : "Pesan Sekarang!"}
        </button>
      </div>

    </main>
  );
}

export default function StumbleGuysContent() {
  return (
    // Fallback bisa berupa loading spinner atau skeleton screen
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <p className="text-sm animate-pulse" style={{ color: "var(--teal)" }}>Menyiapkan halaman...</p>
      </div>
    }>
      <StumbleGuys />
    </Suspense>
  );
}