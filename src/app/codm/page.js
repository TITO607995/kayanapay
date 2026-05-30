"use client";

import { useState, useEffect } from "react";

export default function CallOfDutyMobile() {
  
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

  
  useEffect(() => {
    fetch("http://192.168.100.17:8000/api/topup/products?brand=CALL OF DUTY MOBILE")
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

    fetch("http://192.168.100.17:8000/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPaymentMethods(data.data);
        }
      })
      .catch((error) => console.error("Gagal narik payment:", error));
  }, []);

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Kalkulasi Total
  const price = selectedDenom ? selectedDenom.price_sell : 0;
  const subtotal = price * qty;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const grandTotal = subtotal + adminFee;

  
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
      const response = await fetch("http://192.168.100.17:8000/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          target: `${userId}`, // Cuma 1 parameter target
          product_name: selectedDenom.product_name,
          sku_code: selectedDenom.buyer_sku_code,
          price: price * qty,
          admin_fee: adminFee,
          total_amount: grandTotal,
          payment_method: selectedPayment.paymentMethod,
          payment_name: selectedPayment.paymentName,
          whatsapp: whatsapp,
        })
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
          <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center text-3xl">🎯</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Call Of Duty</h2>
            <p className="text-sm text-slate-500">Garena | Proses Otomatis 1 Detik.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 lg:hidden">
              <button 
                onClick={() => setActiveTab("transaksi")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${
                  activeTab === "transaksi" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Transaksi
              </button>
              <button 
                onClick={() => setActiveTab("keterangan")}
                className={`flex-1 py-3 font-bold rounded-xl transition-all text-sm ${
                  activeTab === "keterangan" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Keterangan
              </button>
            </div>


            <div className={`space-y-6 ${activeTab === "transaksi" ? "block animate-fade-in" : "hidden lg:block"}`}>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">1</span> 
                  Masukkan Data Akun
                </h3>
                <div className="w-full md:w-2/3">
                  <input 
                    type="text" 
                    placeholder="Masukkan Player ID" 
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">2</span> 
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
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md" 
                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:shadow-sm"
                        }`}
                      >
                        <p className="font-bold text-sm text-slate-800">{item.product_name.replace("CALL OF DUTY MOBILE - ", "")}</p>
                        <p className="text-xs font-black text-blue-600 mt-1">{formatRupiah(item.price_sell)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">3</span> 
                  Jumlah Pembelian
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">-</button>
                  <input type="number" value={qty} onChange={(e) => setQty(e.target.value > 0 ? parseInt(e.target.value) : 1)} className="w-20 text-center bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold shadow-inner" />
                  <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xl font-bold transition border border-slate-200">+</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">4</span> 
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
                                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-md" 
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex justify-between items-center w-full mb-3">
                                  <div className="h-8 flex items-center justify-start">
                                    <img src={displayImage} alt={displayName} className="h-full object-contain" />
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-blue-600' : 'border-slate-300'}`}>
                                    {selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                  </div>
                                </div>
                                <div className="flex justify-between items-end w-full">
                                  <p className="font-bold text-sm text-slate-800 text-left">{displayName}</p>
                                  <p className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
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
                              className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{categoryIcons[category]}</span>
                                <span className={`font-bold ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>{category}</span>
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                      ? "border-blue-500 bg-white ring-1 ring-blue-500 shadow-md" 
                                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full mb-2">
                                      <div className="h-6 flex items-center justify-start">
                                        <img src={pay.paymentImage} alt={pay.paymentName} className="h-full object-contain" />
                                      </div>
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-blue-500' : 'border-slate-300'}`}>
                                        {selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-end w-full mt-1">
                                      <p className="font-bold text-xs text-slate-700 text-left line-clamp-1">{pay.paymentName}</p>
                                      <p className="text-[11px] font-black text-blue-500 whitespace-nowrap">
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
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">5</span> 
                  Kode Promo <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                </h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Masukkan kode promo" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition uppercase" />
                  <button className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md">Gunakan</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">6</span> 
                  Detail Kontak
                </h3>
                <input 
                  type="number" 
                  placeholder="Nomor WhatsApp (08...)" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                />
                <p className="text-xs text-slate-400 mt-2">Bukti pembelian akan dikirimkan melalui WhatsApp.</p>
              </div>

            </div>

            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
              <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 uppercase">
                Deskripsi Call Of Duty
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Top up Call Of Duty Cash harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY.
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
                <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 uppercase">
                  Deskripsi Call Of Duty
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Top up Call Of Duty Cash harga paling murah, aman, cepat, dan terpercaya hanya di KAYANAPAY. 
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
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl border border-blue-100">🎯</div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm">CODM</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {selectedDenom ? selectedDenom.product_name.replace("CALL OF DUTY MOBILE - ", "") : "Belum memilih nominal"}
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
                </div>

                <div className="flex justify-between items-center mb-6 pt-2">
                  <span className="text-slate-800 font-bold">Total Bayar</span>
                  <span className="text-blue-600 font-black text-xl">
                    {selectedDenom ? formatRupiah(grandTotal) : "-"}
                  </span>
                </div>

                {/* Tombol Beli (Desktop) */}
                <button 
                  onClick={handleCheckout}
                  className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    selectedDenom && selectedPayment && userId && whatsapp && !isCheckoutLoading
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 cursor-pointer" 
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
            <span className="text-xl font-black text-blue-600">{formatRupiah(grandTotal)}</span>
          </div>
        )}
        
        <button
          onClick={handleCheckout}
          disabled={!selectedDenom || !selectedPayment || !userId || !whatsapp || isCheckoutLoading}
          className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${
            selectedDenom && selectedPayment && userId && whatsapp && !isCheckoutLoading
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isCheckoutLoading ? "Memproses..." : "Pesan Sekarang!"}
        </button>
      </div>

    </main>
  );
}