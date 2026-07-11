"use client";

import { useState } from "react";
import {
  Search,
  Receipt,
  Package,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

export default function CekPesanan() {
  const [invoice, setInvoice] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCariPesanan = async (e) => {
    e.preventDefault();

    if (!invoice) return;

    setIsLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(
        `https://kayanamart.my.id/api/topup/invoice/${invoice}`
      );

      const result = await res.json();

      if (res.ok && result.status === "success") {
        setData(result.data);
      } else {
        setError(
          "Pesanan tidak ditemukan. Pastikan nomor invoice benar."
        );
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUKSES":
        return (
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-xs font-bold">
            <CheckCircle2 size={14} />
            Sukses
          </div>
        );

      case "PENDING":
      case "UNPAID":
        return (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-2 rounded-full text-xs font-bold">
            <Clock3 size={14} />
            Menunggu
          </div>
        );

      case "PAID":
        return (
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-xs font-bold">
            <Wallet size={14} />
            Diproses
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-full text-xs font-bold">
            <XCircle size={14} />
            Gagal
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-6 px-3 sm:px-4">

      <div className="max-w-xl mx-auto space-y-5">

        {/* HERO */}
        <div className="text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center shadow-lg mb-4">
            <Receipt className="text-white" size={28} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Cek Pesanan
          </h1>

          <p className="text-slate-500 text-sm mt-2">
            Lacak transaksi top up & PPOB menggunakan nomor invoice
          </p>

        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">

          <form
            onSubmit={handleCariPesanan}
            className="flex flex-col gap-3"
          >

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="Masukkan nomor invoice..."
                className="
                w-full
                pl-12
                pr-4
                py-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                outline-none
                focus:ring-2
                focus:ring-blue-200
                "
              />

            </div>

            <button
              disabled={!invoice || isLoading}
              className={`
              py-3
              rounded-2xl
              font-bold
              transition
              ${
                !invoice || isLoading
                  ? "bg-slate-200 text-slate-400"
                  : "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-200"
              }
              `}
            >
              {isLoading ? (
                <span className="flex justify-center items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Mencari...
                </span>
              ) : (
                "Cari Pesanan"
              )}
            </button>

          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 p-3 rounded-xl flex gap-3">

              <AlertCircle
                size={18}
                className="text-red-500 mt-0.5"
              />

              <p className="text-sm text-red-600">
                {error}
              </p>

            </div>
          )}

        </div>

        {/* RESULT */}
        {data && (
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg animate-in fade-in">

            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5">

              <div className="flex flex-col gap-4">

                <div>

                  <p className="text-slate-400 text-xs uppercase">
                    Nomor Invoice
                  </p>

                  <h2 className="text-white font-bold break-all">
                    {data.reference}
                  </h2>

                </div>

                {getStatusBadge(data.status)}

              </div>

            </div>

            <div className="p-5 space-y-4">

              <CardItem
                icon={<Package size={18} />}
                title="Produk"
                value={data.product_name}
              />

              <CardItem
                icon={<Receipt size={18} />}
                title="Target / ID"
                value={data.target}
              />

              <CardItem
                icon={<CreditCard size={18} />}
                title="Pembayaran"
                value={data.payment_name}
              />

              <CardItem
                icon={<Wallet size={18} />}
                title="Total"
                value={`Rp ${Number(
                  data.total_amount
                ).toLocaleString("id-ID")}`}
                highlight
              />

              {(data.sn || data.note) && (
                <div className="bg-slate-50 rounded-2xl p-4">

                  <p className="text-xs font-bold text-slate-500 mb-2">
                    KETERANGAN
                  </p>

                  <p className="text-sm break-all font-mono">
                    {data.sn || data.note}
                  </p>

                </div>
              )}

              {data.status === "UNPAID" &&
                data.payment_url && (
                  <a
                    href={data.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                    block
                    text-center
                    bg-gradient-to-r
                    from-blue-600
                    to-sky-500
                    text-white
                    py-3
                    rounded-2xl
                    font-bold
                    shadow-lg
                    "
                  >
                    Lanjutkan Pembayaran
                  </a>
                )}

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

function CardItem({
  icon,
  title,
  value,
  highlight,
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex gap-4">

      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p
          className={`font-bold ${
            highlight
              ? "text-blue-600"
              : "text-slate-800"
          }`}
        >
          {value}
        </p>

      </div>

    </div>
  );
}