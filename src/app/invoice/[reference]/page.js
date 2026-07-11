"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function InvoicePage() {
    const params = useParams();
    const reference = params?.reference;
    
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInvoice = async () => {
        if (!reference) return;
        try {
            const res = await fetch(`https://kayanamart.my.id/api/invoice/${reference}`);
            const json = await res.json();
            
            if (json.status === 'success') {
                setTransaction(json.data);
            }
        } catch (error) {
            console.error("Gagal narik data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. Ambil data awal pas pertama kali page di-load
        fetchInvoice(); 

        // 2. SISTEM REVERB DIHAPUS - DIGANTI POLLING OTOMATIS
        // Cek status ke backend setiap 5 detik jika statusnya masih UNPAID atau PENDING
        const intervalId = setInterval(() => {
            if (transaction && ['SUKSES', 'GAGAL'].includes(transaction.status)) {
                clearInterval(intervalId); // Stop nge-cek kalau status udah final
                return;
            }
            fetchInvoice();
        }, 5000);

        // Cleanup interval saat user pindah halaman
        return () => clearInterval(intervalId);
    }, [reference, transaction?.status]);

    // UI Mapping Status
    const getStatusStyle = (status) => {
        switch(status) {
            case 'SUKSES': 
                return { 
                    bg: 'bg-blue-50/50', 
                    text: 'text-blue-700', 
                    ring: 'ring-1 ring-inset ring-blue-600/20',
                    dot: 'bg-blue-500',
                    label: 'Pembayaran Berhasil' 
                };
            case 'PAID': 
            case 'PENDING': 
                return { 
                    bg: 'bg-amber-50/50', 
                    text: 'text-amber-700', 
                    ring: 'ring-1 ring-inset ring-amber-600/20',
                    dot: 'bg-amber-500',
                    label: 'Sedang Diproses' 
                };
            case 'UNPAID': 
                return { 
                    bg: 'bg-blue-50/50', 
                    text: 'text-blue-700', 
                    ring: 'ring-1 ring-inset ring-blue-600/20',
                    dot: 'bg-blue-500',
                    label: 'Menunggu Pembayaran' 
                };
            case 'GAGAL': 
                return { 
                    bg: 'bg-rose-50/50', 
                    text: 'text-rose-700', 
                    ring: 'ring-1 ring-inset ring-rose-600/20',
                    dot: 'bg-rose-500',
                    label: 'Transaksi Gagal' 
                };
            default: 
                return { 
                    bg: 'bg-slate-50', 
                    text: 'text-slate-600', 
                    ring: 'ring-1 ring-inset ring-slate-500/20',
                    dot: 'bg-slate-400',
                    label: 'Status Tidak Diketahui' 
                };
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-800 rounded-full animate-spin mb-6"></div>
            <p className="text-[13px] font-medium text-slate-500 tracking-wide animate-pulse">Memuat detail transaksi...</p>
        </div>
    );

    if (!transaction) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-[400px] w-full text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-inset ring-slate-100">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Transaksi Tidak Ditemukan</h2>
                <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">Kami tidak dapat menemukan detail untuk referensi transaksi ini.</p>
                <Link href="/" className="inline-flex items-center justify-center w-full py-3.5 bg-slate-900 text-white text-[14px] font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );

    const statusStyle = getStatusStyle(transaction.status);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:py-12 font-sans selection:bg-slate-200 selection:text-slate-900">
            
            <div className="w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-slate-100/80 overflow-hidden relative">
                
                <div className="px-6 py-8 md:px-10 md:pt-10 md:pb-8">
                    
                    {/* Header: Brand & Ref */}
                    <div className="flex justify-between items-center mb-10">
                        <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">KayanaPay</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-slate-400">Ref.</span>
                            <span className="text-[13px] font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md ring-1 ring-inset ring-slate-200/50">{transaction.reference}</span>
                        </div>
                    </div>

                    {/* Status Display */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${['UNPAID', 'PENDING'].includes(transaction.status) ? 'animate-pulse' : ''}`}></span>
                            {statusStyle.label}
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-center mb-10">
                        <p className="text-[13px] text-slate-400 font-medium mb-3">Total Pembayaran</p>
                        <div className="flex items-start justify-center gap-1.5">
                            <span className="text-xl font-medium text-slate-400 mt-1">Rp</span>
                            <span className="text-5xl md:text-6xl font-semibold text-slate-900 tracking-tight">
                                {parseInt(transaction.total_amount).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* BOX QRIS: Hanya muncul kalau UNPAID */}
                    {transaction.status === 'UNPAID' && transaction.payment_url && (
                        <div className="mb-10 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 ring-1 ring-slate-900/5">
                            <p className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-widest">Scan QRIS Untuk Bayar</p>
                            
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-5">
                                <img 
                                    src={transaction.qr_image_base64} 
                                    alt="QRIS KayanaPay"
                                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                />
                            </div>

                            <div className="w-full p-3.5 rounded-xl bg-amber-50/80 ring-1 ring-inset ring-amber-500/20 flex gap-3 items-start text-left">
                                <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠️</span>
                                <p className="text-xs font-medium text-amber-700 leading-relaxed">
                                    Pastikan nominal transfer <b>sama persis hingga 3 digit terakhir</b> agar pesanan otomatis diproses sistem.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Subtle Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent mb-8"></div>

                    {/* Transaction Details */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[14px] text-slate-500">ID Tujuan</span>
                            <span className="text-[14px] font-medium text-slate-900">{transaction.target}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[14px] text-slate-500">Kode Produk</span>
                            <span className="text-[13px] font-medium text-slate-800 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">{transaction.sku_code}</span>
                        </div>
                    </div>

                    {/* SN / Secure Token Section */}
                    {transaction.sn && (
                        <div className="mt-8 p-5 rounded-2xl bg-[#FAFAFA] border border-slate-100 flex flex-col items-center justify-center gap-2">
                            <span className="text-[11px] font-semibold tracking-[0.1em] text-slate-400 uppercase">Nomor SN / Token Bukti</span>
                            <span className="text-[15px] md:text-[16px] font-mono font-medium text-slate-800 text-center break-all">{transaction.sn}</span>
                        </div>
                    )}

                    {/* System Note */}
                    {transaction.note && (
                        <div className="mt-6 p-4 rounded-xl bg-amber-50/50 ring-1 ring-inset ring-amber-500/20 flex gap-3 items-start">
                            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex flex-col gap-1">
                                <span className="text-[12px] font-semibold text-amber-800 uppercase tracking-wider">Catatan Sistem</span>
                                <p className="text-[13px] text-amber-700/90 leading-relaxed">{transaction.note}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:px-10 md:pb-8 md:pt-4 bg-white space-y-3">
                    <Link 
                        href="/" 
                        className="flex items-center justify-center w-full py-4 bg-white text-slate-600 text-[14px] font-medium rounded-xl ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
            
            <div className="mt-8 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
                Secured by KayanaPay © 2026
            </div>
        </div>
    );
}