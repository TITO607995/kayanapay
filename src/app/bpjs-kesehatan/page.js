"use client";

import { useState, useEffect } from "react";

export default function BpjsKesehatan() {
  const [activeTab, setActiveTab] = useState("transaksi"); // UI State for Mobile
  const [customerId, setCustomerId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const [isChecking, setIsChecking] = useState(false);
  const [billData, setBillData] = useState(null); 
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetch("http://192.168.1.9:8000/api/payment/methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setPaymentMethods(data.data);
      })
      .catch((error) => console.error("Gagal narik payment:", error));
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const handleCheckBill = async () => {
    if (!customerId) {
      setErrorMessage("Harap masukkan Nomor VA BPJS!");
      return;
    }

    setIsChecking(true);
    setBillData(null);
    setErrorMessage(null); 

    try {
      const response = await fetch(`http://192.168.1.9:8000/api/topup/inquiry-postpaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: customerId,
          sku_code: "BPJSK" // Langsung hardcode kode BPJS dari Digiflazz
        })
      });
      
      const data = await response.json();
      if (data.status === "success") setBillData(data.data); 
      else setErrorMessage(data.message || "Tagihan tidak ditemukan atau sudah dilunasi.");
    } catch (error) {
      setErrorMessage("Terjadi gangguan saat terhubung ke server. Coba lagi nanti.");
    }
    setIsChecking(false);
  };

  const billAmount = billData ? parseInt(billData.total_tagihan) : 0;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const grandTotal = billAmount + adminFee;

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
      const response = await fetch("http://192.168.1.9:8000/api/payment/checkout-postpaid", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          target: customerId,
          sku_code: "BPJSK",
          ref_id: billData.ref_id, 
          product_name: `BPJS Kesehatan`,
          total_amount: grandTotal,
          payment_method: selectedPayment.paymentMethod,
          payment_name: selectedPayment.paymentName,
          whatsapp: whatsapp,
        })
      });

      const resData = await response.json();
      if (resData.status === "success") window.location.href = resData.data.paymentUrl; 
      else {
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
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-3xl">🏥</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">BPJS Kesehatan</h2>
            <p className="text-sm text-slate-500">Bayar iuran bulanan BPJS Kesehatan tepat waktu.</p>
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
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">1</span> Cek Tagihan BPJS</h3>
                <div className="flex gap-2 w-full">
                  <input type="number" placeholder="Masukkan 11-16 Digit VA Keluarga" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tracking-wider" />
                  <button onClick={handleCheckBill} disabled={isChecking || !customerId} className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isChecking ? "Cek..." : "Cek"}
                  </button>
                </div>
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4 flex items-start gap-3 animate-fade-in">
                    <div className="text-red-500 text-xl mt-0.5">⚠️</div>
                    <div className="flex-1"><h4 className="text-red-800 font-bold text-sm">Pemberitahuan</h4><p className="text-red-600 text-sm mt-1">{errorMessage}</p></div>
                    <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 p-1">✖</button>
                  </div>
                )}
                {billData && !errorMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Nama Peserta</span><span className="font-bold text-slate-800">{billData.nama_pelanggan}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Bulan Dibayar</span><span className="font-bold text-slate-800">{billData.periode}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Total Jiwa</span><span className="font-bold text-slate-800">{billData.tagihan / 35000} Orang (Estimasi Kelas 3)</span></div>
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
                        <button key={pay.paymentMethod} onClick={() => setSelectedPayment(pay)} className={`w-full p-4 rounded-xl border flex flex-col justify-center transition-all ${selectedPayment?.paymentMethod === pay.paymentMethod ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"}`}>
                          <div className="flex justify-between items-center w-full mb-3"><div className="h-8"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" className="h-full object-contain" /></div><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment?.paymentMethod === pay.paymentMethod ? 'border-emerald-500' : 'border-slate-300'}`}>{selectedPayment?.paymentMethod === pay.paymentMethod && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}</div></div>
                          <div className="flex justify-between items-end w-full"><p className="font-bold text-sm text-slate-800 text-left">QRIS All Payment</p><p className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">{pay.totalFee == 0 ? "Gratis" : `+ ${formatRupiah(pay.totalFee)}`}</p></div>
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
                        <div key={category} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-emerald-300 shadow-sm' : 'border-slate-200'}`}>
                          <button onClick={() => setOpenCategory(isOpen ? null : category)} className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-3"><span className="text-xl">{categoryIcons[category]}</span><span className={`font-bold ${isOpen ? 'text-emerald-600' : 'text-slate-700'}`}>{category}</span></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {isOpen && (
                            <div className="p-4 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-emerald-100">
                              {methods.map((pay) => (
                                <button key={pay.paymentMethod} onClick={() => setSelectedPayment(pay)} className={`w-full p-3 rounded-xl border flex flex-col justify-center transition-all ${selectedPayment?.paymentMethod === pay.paymentMethod ? "border-emerald-500 bg-white ring-1 ring-emerald-500 shadow-md" : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"}`}>
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

              {/* STEP 3: Kontak */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md">3</span> 
                  Kode Promo <span className="text-xs font-normal text-slate-400 ml-2">(Opsional)</span>
                </h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Masukkan kode promo" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition uppercase" />
                  <button className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 rounded-xl transition shadow-md">Gunakan</button>
                </div>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                />
                <p className="text-xs text-slate-400 mt-2">Bukti pembelian akan dikirimkan melalui WhatsApp.</p>
              </div>
            </div>

            {/* TAB KETERANGAN (MOBILE) */}
            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200`}>
              <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">Cara Bayar BPJS</h3>
              <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                <li>Pilih tab <b>Transaksi</b>.</li>
                <li>Masukkan Nomor Virtual Account BPJS Kesehatan Anda.</li>
                <li>Klik tombol <b>Cek</b> untuk memunculkan nama & total tagihan.</li>
                <li>Pilih metode pembayaran yang diinginkan.</li>
                <li>Masukkan nomor WhatsApp yang aktif.</li>
                <li>Klik tombol <b>Bayar Sekarang</b> untuk melunasi iuran.</li>
              </ol>
            </div>
          </div>

          {/* KOLOM KANAN (SUMMARY DESKTOP) */}
          <div className="hidden lg:block lg:col-span-1 relative">
            <div className="space-y-6 h-full">
              {/* DESKRIPSI KANAN */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3 uppercase">Cara Bayar BPJS</h3>
                <ol className="list-decimal ml-4 space-y-2 text-slate-600 text-sm font-medium">
                  <li>Masukkan Nomor Virtual Account BPJS Anda.</li>
                  <li>Klik tombol <b>Cek</b> untuk memunculkan nama & total tagihan.</li>
                  <li>Pilih metode pembayaran yang diinginkan.</li>
                  <li>Masukkan nomor WhatsApp.</li>
                  <li>Klik tombol <b>Bayar Sekarang</b> untuk melunasi iuran.</li>
                </ol>
              </div>

              {/* RINCIAN KANAN STICKY */}
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-black text-lg text-slate-800 border-b border-slate-100 pb-4 mb-4">Rincian Tagihan</h3>
                {!billData ? <p className="text-slate-500 text-sm text-center py-10 italic">Cek tagihan Anda terlebih dahulu.</p> : (
                  <>
                    <p className="text-slate-500 text-sm font-bold mb-1">Layanan:</p>
                    <p className="text-slate-800 font-black text-sm mb-4">BPJS Kesehatan</p>
                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Iuran BPJS</span><span className="text-slate-800 font-bold">{formatRupiah(billData.tagihan)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Admin Platform</span><span className="text-slate-800 font-bold">{formatRupiah(billData.admin_fee)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Biaya Transfer</span><span className="text-slate-800 font-bold">{formatRupiah(adminFee)}</span></div>
                    </div>
                    <div className="flex justify-between items-center mb-6 pt-2 border-t border-slate-100"><span className="text-slate-800 font-bold">Total Bayar</span><span className="text-emerald-600 font-black text-xl">{formatRupiah(grandTotal)}</span></div>
                    <button onClick={handleCheckout} disabled={!selectedPayment || !whatsapp || isCheckoutLoading} className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${selectedPayment && whatsapp && !isCheckoutLoading ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"}`}>{isCheckoutLoading ? "Memproses..." : "Bayar Sekarang"}</button>
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
          <button onClick={handleCheckout} disabled={!selectedPayment || !whatsapp || isCheckoutLoading} className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm ${selectedPayment && whatsapp && !isCheckoutLoading ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30" : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"}`}>{isCheckoutLoading ? "Memproses..." : "Bayar Sekarang!"}</button>
        </div>
      )}
    </main>
  );
}