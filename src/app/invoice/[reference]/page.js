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
            const res = await fetch(`http://localhost:8000/api/invoice/${reference}`);
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
        fetchInvoice();

        let interval;
        if (transaction && ['UNPAID', 'PAID', 'PENDING'].includes(transaction.status)) {
            interval = setInterval(() => {
                fetchInvoice();
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [reference, transaction?.status]);

    // Bahasa Manusia Only, Database disembunyiin!
    const getStatusStyle = (status) => {
        switch(status) {
            case 'SUKSES': 
                return { badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', text: 'Pembayaran Berhasil', icon: '✅' };
            case 'PAID': 
            case 'PENDING': 
                return { badge: 'bg-amber-100 text-amber-700 border-amber-300', text: 'Sedang Diproses', icon: '⏳' };
            case 'UNPAID': 
                return { badge: 'bg-rose-100 text-rose-700 border-rose-300', text: 'Menunggu Pembayaran', icon: '💳' };
            case 'GAGAL': 
                return { badge: 'bg-slate-200 text-slate-700 border-slate-400', text: 'Transaksi Gagal', icon: '❌' };
            default: 
                return { badge: 'bg-gray-100 text-gray-700 border-gray-300', text: 'Status Tidak Diketahui', icon: '❓' };
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600 mb-4"></div>
            <p className="font-bold text-slate-500 animate-pulse">Memuat Struk...</p>
        </div>
    );

    if (!transaction) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <span className="text-6xl mb-4">🕵️‍♂️</span>
            <h2 className="text-2xl font-black text-slate-800">Waduh!</h2>
            <p className="text-slate-500 font-medium mb-6">Transaksi tidak ditemukan.</p>
            <Link href="/" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all hover:-translate-y-1">
                Kembali ke Beranda
            </Link>
        </div>
    );

    const statusInfo = getStatusStyle(transaction.status);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans py-12 relative">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10">
                
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-teal-500 to-emerald-700 rounded-b-[3rem] shadow-inner"></div>

                <div className="relative z-10 pt-8 px-6 pb-8 md:px-10">
                    
                    <div className="text-center mb-8">
                        <div className="bg-white p-4 rounded-full inline-flex items-center justify-center shadow-lg shadow-slate-200/50 mb-4 border-2 border-slate-50 w-20 h-20">
                            <span className="text-4xl">{statusInfo.icon}</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">KAYANAPAY</h1>
                        <p className="text-slate-500 text-sm font-semibold mt-1">INV: <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">{transaction.reference}</span></p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Status Pesanan</p>
                        {/* Tulisan RAW database udah ilang, sisa bahasa manusianya aja! */}
                        <div className={`inline-block px-5 py-2 rounded-full text-sm font-black border-2 shadow-sm ${statusInfo.badge} ${['UNPAID', 'PAID', 'PENDING'].includes(transaction.status) ? 'animate-pulse' : ''}`}>
                            {statusInfo.text}
                        </div>
                    </div>

                    <div className="border-b-2 border-dashed border-slate-200 pb-6 mb-6">
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Pembayaran</p>
                            <p className="text-4xl font-black text-slate-800">
                                <span className="text-xl text-slate-400 mr-1">Rp</span>
                                {parseInt(transaction.total_amount).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center">
                            <span className="w-5 h-5 mr-2 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[10px]">🛒</span>
                            Rincian Pembelian
                        </h3>
                        
                        <div className="bg-white rounded-xl space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500 text-sm font-medium">ID Tujuan</span>
                                <span className="font-bold text-slate-800 text-sm">{transaction.target}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-slate-500 text-sm font-medium">Kode Produk</span>
                                <span className="font-bold text-slate-700 text-sm bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wide">{transaction.sku_code}</span>
                            </div>
                            
                            {transaction.sn && (
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-3 bg-emerald-50 px-4 rounded-xl border border-emerald-100 mt-4">
                                    <span className="text-emerald-700 text-xs font-bold uppercase mb-1 md:mb-0">Nomor SN / Bukti:</span>
                                    <span className="font-black text-emerald-800 text-sm font-mono break-all">{transaction.sn}</span>
                                </div>
                            )}
                            
                            {transaction.note && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-600 font-medium flex gap-2 items-start">
                                    <span className="text-lg">⚠️</span>
                                    <p><span className="font-bold">Catatan Sistem:</span> {transaction.note}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-3">
                        {transaction.status === 'UNPAID' && transaction.checkout_url && (
                            <a 
                                href={transaction.checkout_url} 
                                className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all uppercase tracking-wide text-sm"
                            >
                                💳 Lanjutkan Pembayaran
                            </a>
                        )}
                        
                        <Link 
                            href="/" 
                            className="flex items-center justify-center w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-800 transition-all tracking-wide text-sm"
                        >
                            🏠 Kembali Ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 text-center w-full text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                Aman & Terpercaya © 2026 KayanaPay
            </div>
        </div>
    );
}