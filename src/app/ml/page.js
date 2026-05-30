"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── Komponen kecil reusable ──────────────────────────────────────────────────
const StepLabel = ({ n, title, optional }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
      style={{ background: "var(--teal)" }}>
      {n}
    </div>
    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
      {title}
      {optional && <span className="ml-2 font-normal text-xs" style={{ color: "var(--text-tertiary)" }}>(Opsional)</span>}
    </span>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl p-5 border ${className}`} style={{ borderColor: "var(--border)" }}>
    {children}
  </div>
);

const InputField = ({ ...props }) => (
  <input
    {...props}
    className="w-full text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
    style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
    onFocus={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "var(--teal)"; }}
    onBlur={e => { e.target.style.background = "var(--cream-2)"; e.target.style.borderColor = "var(--border)"; }}
  />
);

// ── Halaman Utama ────────────────────────────────────────────────────────────
export default function MobileLegends() {
  const [activeTab, setActiveTab] = useState("transaksi");
  const [selectedDenom, setSelectedDenom] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [qty, setQty] = useState(1);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);

  useEffect(() => {
    fetch("http://192.168.100.17:8000/api/topup/products?brand=MOBILE LEGENDS")
      .then(r => r.json())
      .then(d => { if (d.status === "success") setProducts(d.data); })
      .catch(e => console.error(e));

    fetch("http://192.168.100.17:8000/api/payment/methods")
      .then(r => r.json())
      .then(d => { if (d.status === "success") setPaymentMethods(d.data); setIsLoading(false); })
      .catch(e => { console.error(e); setIsLoading(false); });
  }, []);

  // Auto-cek nickname
  useEffect(() => {
    if (userId.length >= 5 && zoneId.length >= 3) {
      setIsChecking(true);
      setNickname("");
      const t = setTimeout(async () => {
        try {
          const res = await fetch(`http://192.168.100.17:8000/api/topup/check-ml?userid=${userId}&zoneid=${zoneId}`);
          const d = await res.json();
          setNickname(d.status === "success" ? `✓ Halo, ${d.data.nickname}` : "✗ Nickname tidak ditemukan");
        } catch {
          setNickname("✗ Gagal mengecek server");
        } finally {
          setIsChecking(false);
        }
      }, 1000);
      return () => clearTimeout(t);
    } else {
      setNickname("");
      setIsChecking(false);
    }
  }, [userId, zoneId]);

  const formatRupiah = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const price = selectedDenom ? selectedDenom.price_sell : 0;
  const subtotal = price * qty;
  const adminFee = selectedPayment ? parseInt(selectedPayment.totalFee) : 0;
  const grandTotal = subtotal + adminFee;

  // Grup metode pembayaran
  const groupedPayments = paymentMethods.reduce((acc, pay) => {
    let cat = "Lainnya";
    const name = pay.paymentName.toUpperCase();
    if (name.includes("QRIS")) cat = "QRIS";
    else if (name.includes("VA") || name.includes("VIRTUAL")) cat = "Virtual Account";
    else if (["OVO","DANA","SHOPEEPAY","LINKAJA","JENIUS"].some(w => name.includes(w))) cat = "E-Wallet";
    else if (name.includes("RETAIL") || name.includes("INDOMARET") || name.includes("ALFAMART")) cat = "Minimarket";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(pay);
    return acc;
  }, {});

  const categoryOrder = ["QRIS", "E-Wallet", "Virtual Account", "Minimarket", "Lainnya"];
  const categoryIcons = { "QRIS": "🔳", "E-Wallet": "👛", "Virtual Account": "🏦", "Minimarket": "🏪", "Lainnya": "💳" };

  const handleCheckout = async () => {
    if (!userId || !zoneId || !whatsapp) {
      alert("Harap lengkapi User ID, Zone ID, dan Nomor WhatsApp!");
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const res = await fetch("http://192.168.100.17:8000/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          target: `${userId}${zoneId}`,
          product_name: selectedDenom.product_name,
          sku_code: selectedDenom.buyer_sku_code,
          price: price * qty,
          admin_fee: adminFee,
          total_amount: grandTotal,
          payment_method: selectedPayment.paymentMethod,
          payment_name: selectedPayment.paymentName,
          whatsapp,
        }),
      });
      const d = await res.json();
      if (d.status === "success") window.location.href = d.data.paymentUrl;
      else alert("Gagal memproses: " + d.message);
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
    setIsCheckoutLoading(false);
  };

  const canCheckout = selectedDenom && selectedPayment && userId && zoneId && whatsapp && !isCheckoutLoading;

  // ─── Konten Keterangan ────────────────────────────────────────────────────
  const Description = () => (
    <div className="space-y-5">
      <Card>
        <div className="border-l-2 pl-3 mb-4" style={{ borderColor: "var(--teal)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Deskripsi Mobile Legends</h3>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Top up diamond Mobile Legends (MLBB) harga paling murah, aman, cepat, dan terpercaya hanya di KayanaPay.
        </p>
        <div className="mt-4">
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Cara Top Up MLBB</p>
          <ol className="space-y-2">
            {["Masukkan User ID & Zone ID akun ML kamu", "Pilih nominal diamond yang diinginkan", "Tentukan jumlah pembelian", "Pilih metode pembayaran", "Masukkan kode promo (jika ada)", "Isi nomor WhatsApp aktif", "Klik Bayar Sekarang dan selesaikan pembayaran", "Diamond otomatis masuk ke akun kamu"].map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 min-w-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                  style={{ background: "var(--teal-light)", color: "var(--teal)", border: "0.5px solid var(--teal-border)" }}>
                  {i + 1}
                </span>
                <span className="text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );

  // ─── Ringkasan Pesanan ────────────────────────────────────────────────────
  const OrderSummary = () => (
    <Card>
      <h3 className="text-sm font-semibold pb-3 mb-4" style={{ color: "var(--text-primary)", borderBottom: "0.5px solid var(--border)" }}>
        Ringkasan pesanan
      </h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "var(--teal-light)", border: "0.5px solid var(--teal-border)" }}>
          ⚔️
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Mobile Legends</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {selectedDenom ? selectedDenom.product_name.replace("MOBILELEGEND - ", "") : "Belum memilih nominal"}
          </p>
        </div>
      </div>
      <div className="rounded-xl p-3.5 space-y-2.5 mb-4" style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)" }}>
        {[
          ["Harga", selectedDenom ? formatRupiah(price) : "–"],
          ["Jumlah beli", `${qty}x`],
          ["Biaya admin", selectedPayment ? (adminFee === 0 ? "Gratis" : formatRupiah(adminFee)) : "–"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-sm">
            <span style={{ color: "var(--text-tertiary)" }}>{l}</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-baseline mb-5">
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Total bayar</span>
        <span className="text-xl font-semibold" style={{ color: "var(--teal)" }}>
          {selectedDenom ? formatRupiah(grandTotal) : "–"}
        </span>
      </div>
      <button
        onClick={handleCheckout}
        disabled={!canCheckout}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
        style={canCheckout
          ? { background: "var(--teal)", color: "#fff", cursor: "pointer" }
          : { background: "var(--cream-3)", color: "var(--text-tertiary)", cursor: "not-allowed" }
        }
      >
        {isCheckoutLoading ? "Memproses..." : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
            </svg>
            Bayar sekarang
          </>
        )}
      </button>
      <p className="text-center text-xs mt-3 flex items-center justify-center gap-1" style={{ color: "var(--text-tertiary)" }}>
        🔒 Transaksi aman &amp; terenkripsi
      </p>
    </Card>
  );

  return (
    <main className="pb-28 lg:pb-12" style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs mb-5 flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
          <Link href="/" style={{ color: "var(--text-tertiary)" }}>Beranda</Link>
          <span>/</span>
          <span>Top Up Game</span>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>Mobile Legends</span>
        </nav>

        {/* Header game */}
        <Card className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "var(--teal-light)", border: "0.5px solid var(--teal-border)" }}>
            ⚔️
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Mobile Legends: Bang Bang</h1>
            <p className="text-sm mt-1 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              Moonton
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: "#ECFDF5", color: "#059669", border: "0.5px solid #A7F3D0" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Proses instan
              </span>
            </p>
          </div>
        </Card>

        {/* Mobile tab toggle */}
        <div className="flex gap-1.5 mb-5 lg:hidden rounded-xl p-1" style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)" }}>
          {["transaksi", "keterangan"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
              style={activeTab === tab
                ? { background: "#fff", color: "var(--teal)", border: "0.5px solid var(--teal-border)" }
                : { background: "transparent", color: "var(--text-secondary)", border: "none" }
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ─── KOLOM KIRI — Form Transaksi ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Konten transaksi (desktop selalu tampil, mobile ikut tab) */}
            <div className={activeTab === "transaksi" ? "block animate-fade-in" : "hidden lg:block"}>

              {/* STEP 1: Data Akun */}
              <Card className="mb-4">
                <StepLabel n="1" title="Masukkan data akun" />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InputField type="number" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
                  </div>
                  <div className="w-28">
                    <InputField type="number" placeholder="Zone ID" value={zoneId} onChange={e => setZoneId(e.target.value)} />
                  </div>
                </div>
                <div className="h-5 mt-2 pl-1">
                  {isChecking && <p className="text-xs animate-pulse" style={{ color: "var(--teal)" }}>Mencari nickname...</p>}
                  {!isChecking && nickname && (
                    <p className="text-xs font-medium" style={{ color: nickname.includes("✗") ? "#DC2626" : "var(--teal)" }}>{nickname}</p>
                  )}
                </div>
              </Card>

              {/* STEP 2: Pilih Nominal */}
              <Card className="mb-4">
                <StepLabel n="2" title="Pilih nominal top up" />
                {isLoading ? (
                  <p className="text-sm text-center py-8 animate-pulse" style={{ color: "var(--text-tertiary)" }}>Mengambil daftar harga...</p>
                ) : (
                  <div className="space-y-5">
                    {/* Weekly/Special Pass */}
                    {products.filter(p => p.product_name.toLowerCase().includes("weekly") || p.product_name.toLowerCase().includes("pass")).length > 0 && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                          🎟️ Weekly Pass <span className="flex-1 h-px" style={{ background: "var(--border)" }}></span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {products
                            .filter(p => p.product_name.toLowerCase().includes("weekly") || p.product_name.toLowerCase().includes("pass"))
                            .sort((a, b) => a.price_sell - b.price_sell)
                            .map(item => (
                              <DenomBtn key={item.buyer_sku_code} item={item} selected={selectedDenom} onSelect={setSelectedDenom} />
                            ))}
                        </div>
                      </div>
                    )}
                    {/* Diamonds */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
                        💎 Diamonds <span className="flex-1 h-px" style={{ background: "var(--border)" }}></span>
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {products
                          .filter(p => !p.product_name.toLowerCase().includes("weekly") && !p.product_name.toLowerCase().includes("pass") && !p.product_name.toLowerCase().includes("cek"))
                          .sort((a, b) => a.price_sell - b.price_sell)
                          .map(item => (
                            <DenomBtn key={item.buyer_sku_code} item={item} selected={selectedDenom} onSelect={setSelectedDenom} />
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* STEP 3: Jumlah */}
              <Card className="mb-4">
                <StepLabel n="3" title="Jumlah pembelian" />
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold transition"
                    style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}>
                    −
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center text-sm font-semibold rounded-xl py-2 outline-none"
                    style={{ background: "#fff", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold transition"
                    style={{ background: "var(--cream-2)", border: "0.5px solid var(--border)", color: "var(--text-primary)" }}>
                    +
                  </button>
                </div>
              </Card>

              {/* STEP 4: Pembayaran */}
              <Card className="mb-4">
                <StepLabel n="4" title="Pilih pembayaran" />
                {paymentMethods.length === 0 && !isLoading ? (
                  <p className="text-sm" style={{ color: "#DC2626" }}>Metode pembayaran sedang tidak tersedia.</p>
                ) : (
                  <div className="space-y-3">
                    {/* QRIS full-width */}
                    {groupedPayments["QRIS"]?.map(pay => (
                      <PaymentRow key={pay.paymentMethod} pay={pay} selected={selectedPayment} onSelect={setSelectedPayment} label="QRIS All Payment" fee={pay.totalFee} />
                    ))}
                    {/* Accordion kategori lain */}
                    {categoryOrder.filter(c => c !== "QRIS").map(cat => {
                      const methods = groupedPayments[cat];
                      if (!methods?.length) return null;
                      const isOpen = openCategory === cat;
                      return (
                        <div key={cat} className="rounded-xl overflow-hidden" style={{ border: `0.5px solid ${isOpen ? "var(--teal-border)" : "var(--border)"}` }}>
                          <button
                            onClick={() => setOpenCategory(isOpen ? null : cat)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition"
                            style={{ background: isOpen ? "var(--teal-light)" : "#fff", color: isOpen ? "var(--teal)" : "var(--text-primary)" }}
                          >
                            <span className="flex items-center gap-2">{categoryIcons[cat]} {cat}</span>
                            <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3" style={{ background: "var(--cream-2)", borderTop: "0.5px solid var(--border)" }}>
                              {methods.map(pay => (
                                <PaymentRow key={pay.paymentMethod} pay={pay} selected={selectedPayment} onSelect={setSelectedPayment} fee={pay.totalFee} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* STEP 5: Kode Promo */}
              <Card className="mb-4">
                <StepLabel n="5" title="Kode promo" optional />
                <div className="flex gap-2">
                  <InputField type="text" placeholder="Masukkan kode promo" className="flex-1 uppercase" />
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium transition"
                    style={{ background: "var(--cream-3)", color: "var(--text-primary)", border: "0.5px solid var(--border)" }}>
                    Pakai
                  </button>
                </div>
              </Card>

              {/* STEP 6: WhatsApp */}
              <Card>
                <StepLabel n="6" title="Nomor WhatsApp" />
                <InputField type="number" placeholder="08xxxxxxxxxx" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                  ℹ️ Bukti pembelian akan dikirimkan melalui WhatsApp.
                </p>
              </Card>
            </div>

            {/* Keterangan — Mobile only */}
            <div className={`${activeTab === "keterangan" ? "block animate-fade-in" : "hidden"} lg:hidden`}>
              <Description />
            </div>
          </div>

          {/* ─── KOLOM KANAN — Desktop only ──────────────────────────────── */}
          <div className="hidden lg:block space-y-4">
            <Description />
            <div className="sticky top-20">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Fixed bottom bar — Mobile only ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full lg:hidden z-50 px-4 py-3"
        style={{ background: "#fff", borderTop: "0.5px solid var(--border)" }}>
        <div className="max-w-md mx-auto">
          {selectedDenom && (
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Total bayar</span>
              <span className="text-lg font-semibold" style={{ color: "var(--teal)" }}>{formatRupiah(grandTotal)}</span>
            </div>
          )}
          <button
            onClick={handleCheckout}
            disabled={!canCheckout}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={canCheckout
              ? { background: "var(--teal)", color: "#fff", cursor: "pointer" }
              : { background: "var(--cream-3)", color: "var(--text-tertiary)", cursor: "not-allowed" }
            }
          >
            {isCheckoutLoading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
    </main>
  );
}

// ── Sub-komponen ─────────────────────────────────────────────────────────────
function DenomBtn({ item, selected, onSelect }) {
  const isOn = selected?.buyer_sku_code === item.buyer_sku_code;
  return (
    <button
      onClick={() => onSelect(item)}
      className="p-3 rounded-xl border text-left transition-all"
      style={{
        background: isOn ? "var(--teal-light)" : "var(--cream-2)",
        borderColor: isOn ? "var(--teal)" : "var(--border)",
        boxShadow: isOn ? "0 0 0 1px var(--teal)" : "none",
      }}
    >
      <p className="text-xs font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
        {item.product_name.replace("MOBILELEGEND - ", "")}
      </p>
      <p className="text-xs font-semibold mt-1" style={{ color: "var(--teal)" }}>
        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price_sell)}
      </p>
    </button>
  );
}

function PaymentRow({ pay, selected, onSelect, label, fee }) {
  const isOn = selected?.paymentMethod === pay.paymentMethod;
  const displayLabel = label || pay.paymentName;
  return (
    <button
      onClick={() => onSelect(pay)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
      style={{
        background: isOn ? "var(--teal-light)" : "#fff",
        borderColor: isOn ? "var(--teal)" : "var(--border)",
      }}
    >
      {pay.paymentImage ? (
        <img src={pay.paymentImage} alt={displayLabel} className="h-6 object-contain flex-shrink-0" style={{ maxWidth: "60px" }} />
      ) : (
        <span className="text-sm">💳</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{displayLabel}</p>
      </div>
      <span className="text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-lg"
        style={{ background: "var(--teal-light)", color: "var(--teal)", border: "0.5px solid var(--teal-border)" }}>
        {parseInt(fee) === 0 ? "Gratis" : `+ Rp ${parseInt(fee).toLocaleString("id-ID")}`}
      </span>
      <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ border: `1.5px solid ${isOn ? "var(--teal)" : "var(--border-dark)"}` }}>
        {isOn && <div className="w-2 h-2 rounded-full" style={{ background: "var(--teal)" }}></div>}
      </div>
    </button>
  );
}