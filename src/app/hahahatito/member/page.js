"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ── Toast Component ───────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  
  const s = type === "success"
    ? { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46" }
    : { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B" };

  return (
    <div className="fixed top-5 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl transition-all"
      style={{ transform: "translateX(-50%)", background: s.bg, border: `1px solid ${s.border}`, color: s.color, minWidth: 280, maxWidth: "90vw" }}>
      <span className="flex-shrink-0">
        {type === "success" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        )}
      </span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="text-xl leading-none opacity-40 hover:opacity-80">×</button>
    </div>
  );
}

// ── Auth Headers ──────────────────────────────────────────────────────────────
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem("kayana_admin_token") : '';
const authHeaders = () => {
  return { 
    Accept: "application/json", 
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}` 
  };
};

// ── Main Content ──────────────────────────────────────────────────────────────
function MemberListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlPage = parseInt(searchParams.get("page")) || 1;

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentPage, setCurrentPage] = useState(urlPage);
  const itemsPerPage = 10;

  // State Aksi Modals
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    koin: 0
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("https://kayanamart.my.id/api/admin/members", {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        setMembers(data.data);
      } else {
        setMembers([]); 
      }
    } catch (error) {
      showToast("Gagal memuat data member dari server.", "error");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    router.replace(`?page=${newPage}`);
  };

  // Trigger Edit Modal
  const handleEditClick = (member) => {
    setFormData({
      name: member.name || "",
      email: member.email || "",
      whatsapp: member.whatsapp || "",
      koin: member.koin || 0
    });
    setEditingMember(member);
  };

  // Simpan Perubahan Edit
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`https://kayanamart.my.id/api/admin/members/${editingMember.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Data member berhasil diperbarui!");
        setEditingMember(null);
        fetchMembers();
      } else {
        showToast(data.message || "Gagal mengupdate member.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
    setIsSaving(false);
  };

  // Eksekusi Hapus Permanen
  const handleConfirmDelete = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`https://kayanamart.my.id/api/admin/members/${deletingMember.id}`, {
        method: "DELETE",
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.status === "success") {
        showToast("Member berhasil dihapus!");
        setDeletingMember(null);
        fetchMembers();
      } else {
        showToast("Gagal menghapus member.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
    setIsSaving(false);
  };

  // Filter Data
  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) { pages.push(i); }
    return pages;
  };

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Daftar Member</h2>
          <p className="text-xs text-slate-400 mt-0.5">Kelola pengguna aplikasi dan pantau saldo koin.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Cari nama, email, atau WA..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-400 transition text-slate-700" 
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 bg-white">
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Info Pengguna</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap">Kontak Info</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap text-center">Saldo Koin</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap text-center">Tgl Bergabung</th>
                    <th className="px-5 py-3 font-medium whitespace-nowrap text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-xs text-slate-400">
                        {searchTerm ? "Tidak ada member yang cocok dengan pencarian." : "Belum ada member yang terdaftar."}
                      </td>
                    </tr>
                  ) : (
                    currentMembers.map((member) => (
                      <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">{member.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">@{member.username || 'user'}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-medium text-slate-700 block text-xs">{member.whatsapp}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{member.email}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-lg font-bold text-xs">
                            🪙 {(member.koin || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center text-xs text-slate-500 font-medium">
                          {new Date(member.created_at).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditClick(member)} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition font-medium">
                              Edit
                            </button>
                            <button onClick={() => setDeletingMember(member)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition font-medium">
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  Menampilkan <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> dari <span className="font-medium text-slate-700">{filteredMembers.length}</span> member
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">← Prev</button>
                  
                  <div className="hidden sm:flex gap-1.5 mx-1">
                    {getPageNumbers().map(num => (
                      <button key={num} onClick={() => handlePageChange(num)} className={`w-8 h-8 flex items-center justify-center text-xs rounded-xl transition ${currentPage === num ? "bg-slate-900 text-white font-medium shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}>{num}</button>
                    ))}
                  </div>

                  <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      {editingMember && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-semibold text-slate-800">Edit Profil Member</h3>
              <button onClick={() => setEditingMember(null)} className="text-xl leading-none text-slate-400 hover:text-slate-600 transition">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nama Lengkap</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email Login</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Nomor WhatsApp</label>
                <input type="text" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Manajemen Koin Saldo</label>
                <input type="number" required value={formData.koin} onChange={(e) => setFormData({...formData, koin: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-600 outline-none focus:border-slate-400 transition" />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-full">Batal</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2.5 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition font-medium disabled:opacity-50 w-full">
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VERIFIKASI 2 LANGKAH HAPUS MODAL ────────────────────────────────── */}
      {deletingMember && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">⚠️</div>
            <h3 className="text-base font-bold text-slate-800">Yakin Hapus Member?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Akun <span className="font-bold text-slate-700">{deletingMember.name}</span> akan dihapus permanen dari aplikasi KayanaPay beserta seluruh data koinnya!
            </p>

            <div className="flex gap-2 pt-5 mt-2">
              <button type="button" onClick={() => setDeletingMember(null)} className="px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-full font-semibold">Tidak, Batal</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isSaving} className="px-4 py-2.5 text-xs rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-bold disabled:opacity-50 w-full">
                {isSaving ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────────
export default function PageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="text-sm font-medium text-slate-400 animate-pulse">Menyiapkan Panel Member...</div>
      </div>
    }>
      <MemberListContent />
    </Suspense>
  )
}