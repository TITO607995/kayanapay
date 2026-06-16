export const metadata = {
    title: 'Syarat & Ketentuan - KayanaPay',
    description: 'Syarat dan ketentuan layanan transaksi di KayanaPay.',
};

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-sm border border-gray-200 rounded-2xl">
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest mb-6 border-b-2 border-teal-600 pb-3">
                    Syarat dan Ketentuan
                </h1>
                
                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <p>
                        Dengan mendaftar dan menggunakan layanan <strong>KayanaPay</strong>, Anda secara otomatis setuju untuk tunduk pada Syarat dan Ketentuan berikut. Mohon baca dengan saksama.
                    </p>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">A. Penggunaan Layanan</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Pengguna dilarang keras menggunakan KayanaPay untuk aktivitas ilegal, pencucian uang, atau penipuan.</li>
                            <li>Pengguna bertanggung jawab penuh atas kebenaran nomor tujuan transaksi. Kesalahan input nomor oleh pengguna bukan tanggung jawab KayanaPay.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">B. Kebijakan Transaksi & Saldo</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Saldo yang telah didepositkan ke akun KayanaPay bersifat <strong>non-refundable</strong> (tidak dapat ditarik ke rekening bank atau diuangkan kembali), dan hanya dapat digunakan untuk bertransaksi di dalam platform.</li>
                            <li>Jika terjadi gangguan dari sisi provider pusat (Biller) yang menyebabkan transaksi tertunda (Pending) atau Gagal, saldo akan dikembalikan ke akun KayanaPay Anda secara otomatis sesuai status final dari pusat.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">C. Perubahan Layanan</h2>
                        <p>KayanaPay berhak untuk mengubah harga layanan, biaya admin, dan kebijakan sewaktu-waktu tanpa pemberitahuan sebelumnya untuk menyesuaikan dengan ketentuan biller pusat dan kondisi pasar.</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400">
                        Pembaruan Terakhir: 14 Juni 2026
                    </div>
                </div>
            </div>
        </main>
    );
}