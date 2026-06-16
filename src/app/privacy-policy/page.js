export const metadata = {
    title: 'Kebijakan Privasi - KayanaPay',
    description: 'Kebijakan privasi dan perlindungan data pengguna KayanaPay.',
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white shadow-sm border border-gray-200 rounded-2xl">
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest mb-6 border-b-2 border-teal-600 pb-3">
                    Kebijakan Privasi
                </h1>
                
                <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                    <p>
                        Kami di <strong>KayanaPay</strong> (PT Kayana Jaya Makmur) sangat menghargai privasi data Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan di <span className="text-teal-600 font-bold">kayanapay.my.id</span>.
                    </p>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">A. Informasi yang Kami Kumpulkan</h2>
                        <p>Saat Anda mendaftar dan bertransaksi, kami mengumpulkan informasi dasar seperti: Nama, Alamat Email, Nomor Telepon/WhatsApp, dan histori transaksi.</p>
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">B. Penggunaan Informasi</h2>
                        <p>Kami hanya menggunakan data Anda untuk:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Memproses transaksi PPOB (Pulsa, Token PLN, Tagihan, dll) ke biller pusat.</li>
                            <li>Mengirimkan notifikasi status transaksi dan pembaruan layanan.</li>
                            <li>Mencegah tindakan penipuan (fraud) dan menjaga keamanan akun Anda.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-2 uppercase">C. Keamanan Data</h2>
                        <p>KayanaPay berkomitmen secara penuh untuk <strong>tidak akan pernah</strong> menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga mana pun untuk tujuan pemasaran (seperti telemarketing atau pinjaman online).</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400">
                        Pembaruan Terakhir: 14 Juni 2026
                    </div>
                </div>
            </div>
        </main>
    );
}