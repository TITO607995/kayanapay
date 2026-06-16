"use client";

import { useState, useEffect, useRef } from "react";

export default function Pdam() {
  const [activeTab, setActiveTab] = useState("transaksi"); // UI State for Mobile
  const [customerId, setCustomerId] = useState("");
  const [areaCode, setAreaCode] = useState(""); 
  const [whatsapp, setWhatsapp] = useState("");
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [billData, setBillData] = useState(null); 
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Daftar Wilayah PDAM
  const pdamList = [
    { code: "PDAMBJN", name: "PDAM Kab Bojonegoro" },
    { code: "PDAMGSK", name: "PDAM Kab Gresik" },
    { code: "PDAMJMB", name: "PDAM Kab Jombang" },
    { code: "PDAMLMG", name: "PDAM Kab Lamongan" },
    { code: "PDAMMLG", name: "PDAM Kab Malang" },
    { code: "PDAMSBY", name: "PDAM Kota Surabaya" },
    { code: "PDAMSDA", name: "PDAM Kab Sidoarjo" },
    { code: "PDAMBKL", name: "PDAM Kab Bangkalan" },
    { code: "PDAMBWI", name: "PDAM Kab Banyuwangi" },
    { code: "PDAMKDR", name: "PDAM Kab Kediri" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setDiscountAmount(parseInt(data.data.discount) || 0);
        setPromoError("");
        alert("✅ Promo berhasil dipakai!");
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoError("❌ " + (data.message || "Kode promo tidak valid."));
      }
    } catch (error) {
      setPromoError("❌ Gagal cek promo, coba lagi.");
      console.error(error);
    }

    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode("");
    setPromoError("");
  };

  const filteredPdam = pdamList.filter((pdam) => 
    pdam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch("https://kayanamart.my.id/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPaymentMethods(data.data);
        }
      })
      .catch((error) => console.error("Gagal narik payment:", error));
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const handleCheckBill = async () => {
    if (!customerId || !areaCode) {
      setErrorMessage("Harap pilih wilayah dan masukkan Nomor Pelanggan!");
      return;
    }

    setIsChecking(true);
    setBillData(null);
    setErrorMessage(null); 

    try {
      const response = await fetch(`https://kayanamart.my.id/api/topup/inquiry-postpaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: customerId,
          sku_code: areaCode 
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setBillData(data.data); 
      } else {
        setErrorMessage(data.message || "Tagihan tidak ditemukan atau sudah dilunasi.");
      }
    } catch (error) {
      setErrorMessage("Terjadi gangguan saat terhubung ke server PDAM. Coba lagi nanti.");
    }
    
    setIsChecking(false);
  };

  const billAmount = billData ? parseInt(billData.total_tagihan) : 0;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const grandTotal = Math.max(0, billAmount + adminFee - discountAmount);

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

  const categoryIcons = { "QRIS": "🔳", "E-Wallet": "👛", "Virtual Account (Transfer Bank)": "🏦", "Gerai Retail / Minimarket": "🏪", "Lainnya": "💳" };
  const categoryOrder = ["QRIS", "E-Wallet", "Virtual Account (Transfer Bank)", "Gerai Retail / Minimarket", "Lainnya"];

  const handleCheckout = async () => {
    if (!billData || !whatsapp || !selectedPayment) {
      setErrorMessage("Harap lengkapi metode pembayaran dan nomor WhatsApp!");
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const response = await fetch("https://kayanamart.my.id/api/payment/checkout-postpaid", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          target: customerId,
          sku_code: areaCode,
          ref_id: billData.ref_id, 
          product_name: `PDAM ${searchTerm}`,
          total_amount: grandTotal,
          payment_method: selectedPayment.paymentMethod,
          payment_name: selectedPayment.paymentName,
          whatsapp: whatsapp,
          promo_code: appliedPromo || null,
          discount_amount: discountAmount,
        })
      });

      const resData = await response.json();
      if (resData.status === "success") {
        window.location.href = resData.data.paymentUrl; 
      } else {
        setErrorMessage("Gagal memproses pembayaran: " + resData.message);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsCheckoutLoading(false);
  };

  return (
    <main className="min-h-screen font-sans pb-36 lg:pb-20 bg-slate-50 relative">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        <div className="flex items-center gap-4 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 text-emerald-600 rounded-xl flex items-center justify-center text-3xl">💧</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Tagihan PDAM</h2>
            <p className="text-sm text-slate-500">Cek dan bayar tagihan air tepat waktu.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* SWITCHER TABS (MOBILE) */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 lg:hidden">
              <button 
                onClick={() => setActiveTab("transaksi")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${activeTab === "transaksi" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >Transaksi</button>
              <button 
                onClick={() => setActiveTab("keterangan")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${activeTab === "keterangan" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >Keterangan</button>
            </div>

            <div className={`space-y-6 ${activeTab === "transaksi" ? "block animate-fade-in" : "hidden lg:block"}`}>
              {/* STEP 1: Cek Tagihan */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">1</span> Cek Tagihan</h3>
                
                <div className="flex flex-col gap-3 mb-4">
                  {/* DROPDOWN SEARCH PDAM */}
                  <div className="relative w-full md:w-2/3" ref={dropdownRef}>
                    <input type="text" placeholder="-- Ketik / Cari Wilayah PDAM --" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); setAreaCode(""); }} onFocus={() => setIsDropdownOpen(true)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-text" />
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-[220px] overflow-y-auto">
                        {filteredPdam.length > 0 ? (
                          filteredPdam.map((pdam) => (
                            <button key={pdam.code} onClick={() => { setAreaCode(pdam.code); setSearchTerm(pdam.name); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-slate-100 last:border-b-0 text-sm font-bold text-slate-700 hover:text-emerald-600">
                              {pdam.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm font-medium text-slate-400 text-center">Wilayah tidak ditemukan</div>
                        )}
                      </div>
                    )}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>

                  <div className="flex gap-2 w-full md:w-2/3">
                    <input type="text" placeholder="Nomor Pelanggan" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                    <button onClick={handleCheckBill} disabled={isChecking || !customerId || !areaCode} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed">
                      {isChecking ? "Cek..." : "Cek"}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4 flex items-start gap-3 animate-fade-in">
                    <div className="text-red-500 text-xl mt-0.5">⚠️</div>
                    <div className="flex-1"><h4 className="text-red-800 font-bold text-sm">Pemberitahuan</h4><p className="text-red-600 text-sm mt-1">{errorMessage}</p></div>
                    <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 p-1">✖</button>
                  </div>
                )}

                {billData && !errorMessage && (
                  <div className="bg-emerald-50 border border-blue-100 p-4 rounded-xl mt-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Nama Pelanggan</span><span className="font-bold text-slate-800">{billData.nama_pelanggan}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Periode Tagihan</span><span className="font-bold text-slate-800">{billData.periode}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Jumlah Tagihan</span><span className="font-bold text-slate-800">{formatRupiah(billData.tagihan)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Biaya Admin Web</span><span className="font-bold text-slate-800">{formatRupiah(billData.admin_fee)}</span></div>
                  </div>
                )}
              </div>

              {/* STEP 2: Pembayaran */}
              <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${!billData ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">2</span> Pilih Pembayaran</h3>
                <div className="space-y-6">
                  {groupedPayments["QRIS"] && groupedPayments["QRIS"].length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {groupedPayments["QRIS"].map((pay) => (
                        <button key={pay.paymentMethod} onClick={() => setSelectedPayment(pay)} className={`w-full p-4 rounded-xl border flex flex-col justify-center transition-all ${selectedPayment?.paymentMethod === pay.paymentMethod ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}>
                          <div className="flex justify-between items-center w-full mb-3"><div className="h-8"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-full object-contain" /></div><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-emerald-500' : 'border-slate-300'}`}>{selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}</div></div>
                          <div className="flex justify-between items-end w-full"><p className="font-bold text-sm text-slate-800 text-left">QRIS All Payment</p><p className="text-xs font-black text-emerald-600 bg-blue-100 px-2 py-1 rounded-md">{pay.totalFee == 0 ? "Gratis" : `+ ${formatRupiah(pay.totalFee)}`}</p></div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {categoryOrder.filter(cat => cat !== "QRIS").map((category) => {
                      const methods = groupedPayments[category];
                      if (!methods || methods.length === 0) return null; 
                      const isOpen = openCategory === category;
                      return (
                        <div key={category} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-300 shadow-sm' : 'border-slate-200'}`}>
                          <button onClick={() => setOpenCategory(isOpen ? null : category)} className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-3"><span className="text-xl">{categoryIcons[category]}</span><span className={`font-bold ${isOpen ? 'text-emerald-600' : 'text-slate-700'}`}>{category}</span></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isOpen && (
                            <div className="p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-blue-100">
                              {methods.map((pay) => (
                                <button key={pay.paymentMethod} onClick={() => setSelectedPayment(pay)} className={`w-full p-3 rounded-xl border flex flex-col justify-center transition-all ${selectedPayment?.paymentMethod === pay.paymentMethod ? "border-emerald-500 bg-white ring-1 ring-emerald-500 shadow-md" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"}`}>
                                  <div className="flex justify-between items-center w-full mb-2"><div className="h-6"><img src={pay.paymentImage} alt={pay.paymentName} className="h-full object-contain" /></div><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-emerald-500' : 'border-slate-300'}`}>{selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}</div></div>
                                  <div className="flex justify-between items-end w-full"><p className="font-bold text-xs text-slate-700 text-left line-clamp-1">{pay.paymentName}</p><p className="text-[11px] font-black text-emerald-500 whitespace-nowrap">{pay.totalFee == 0 ? "Gratis" : `+ ${formatRupiah(pay.totalFee)}`}</p></div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">3</span>
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

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">4</span> 
                  Detail Kontak
                </h3>
                <input 
                  type="number" 
                  placeholder="Nomor WhatsApp (08...)" 
                  value={whatsapp || ""}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                />
                <p className="text-xs text-slate-400 mt-2">Bukti pembelian akan dikirimkan melalui WhatsApp.</p>
              </div>
            </div>

            {/* TAB KETERANGAN (MOBILE) */}
            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
              <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">Cara Bayar PDAM</h3>
              <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                <li>Pilih wilayah PDAM dan masukkan Nomor Pelanggan.</li>
                <li>Klik tombol <b>Cek</b> untuk melihat total tagihan.</li>
                <li>Pilih metode pembayaran yang diinginkan.</li>
                <li>Masukkan nomor WhatsApp yang aktif.</li>
                <li>Klik tombol <b>Bayar Sekarang</b> untuk melunasi tagihan.</li>
              </ol>
            </div>
          </div>

          {/* KOLOM KANAN (SUMMARY DESKTOP) */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <div className="space-y-6 h-full">
              {/* DESKRIPSI KANAN */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">Cara Bayar PDAM</h3>
                <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                  <li>Pilih wilayah PDAM dan masukkan Nomor Pelanggan.</li>
                  <li>Klik tombol <b>Cek</b> untuk melihat total tagihan.</li>
                  <li>Pilih metode pembayaran yang diinginkan.</li>
                  <li>Masukkan nomor WhatsApp.</li>
                  <li>Klik tombol <b>Bayar Sekarang</b> untuk melunasi tagihan.</li>
                </ol>
              </div>

              {/* RINCIAN KANAN STICKY */}
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4">Rincian Tagihan</h3>
                {!billData ? <p className="text-slate-500 text-sm text-center py-10 italic">Cek tagihan Anda terlebih dahulu.</p> : (
                  <>
                    <p className="text-slate-500 text-sm font-bold mb-1">Layanan:</p>
                    <p className="text-slate-800 font-black text-sm mb-4">PDAM Pascabayar</p>
                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Tagihan Air</span><span className="text-slate-800 font-bold">{formatRupiah(billData.tagihan)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Admin Platform</span><span className="text-slate-800 font-bold">{formatRupiah(billData.admin_fee)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Biaya Transfer</span><span className="text-slate-800 font-bold">{formatRupiah(adminFee)}</span></div>
                    </div>
                    <div className="flex justify-between items-center mb-6 pt-2 border-t border-slate-100"><span className="text-slate-800 font-bold">Total Bayar</span><span className="text-emerald-600 font-black text-xl">{formatRupiah(grandTotal)}</span></div>
                    <button onClick={handleCheckout} disabled={!selectedPayment || !whatsapp || isCheckoutLoading} className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${selectedPayment && whatsapp && !isCheckoutLoading ? "bg-emerald-600 hover:bg-blue-700 text-white shadow-emerald-600/30 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}>{isCheckoutLoading ? "Memproses..." : "Bayar Sekarang"}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING BOTTOM BAR MOBILE */}
      {billData && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 lg:hidden rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] flex flex-col gap-3 transition-transform animate-slide-up">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-xl font-black text-emerald-600">{formatRupiah(grandTotal)}</span>
          </div>
          <button onClick={handleCheckout} disabled={!selectedPayment || !whatsapp || isCheckoutLoading} className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${selectedPayment && whatsapp && !isCheckoutLoading ? "bg-emerald-600 hover:bg-blue-700 text-white shadow-lg shadow-emerald-600/30" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"}`}>{isCheckoutLoading ? "Memproses..." : "Bayar Sekarang!"}</button>
        </div>
      )}
    </main>
  );
}