export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Selamat Datang, Bos Kayana! 🚀</h2>
        <p className="text-slate-500 mt-2">Ini adalah pusat komando web top-up lu. Semua kendali ada di tangan lu sekarang.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-bold text-sm mb-2">Total Transaksi Hari Ini</h3>
          <p className="text-4xl font-black text-blue-600">0 <span className="text-sm text-slate-400 font-medium">trx</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-bold text-sm mb-2">Produk Diskon Aktif</h3>
          <p className="text-4xl font-black text-emerald-500">0 <span className="text-sm text-slate-400 font-medium">item</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-bold text-sm mb-2">Banner Aktif</h3>
          <p className="text-4xl font-black text-amber-500">0 <span className="text-sm text-slate-400 font-medium">gambar</span></p>
        </div>
      </div>
    </div>
  );
}