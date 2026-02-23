'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI } from '@/lib/api';
import { ExternalLink, Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function PeminjamanUserPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [loadingBorrowings, setLoadingBorrowings] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed'>('ongoing');
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [selectedBorrowing, setSelectedBorrowing] = useState<{ id: number, type: 'pickup' | 'return' } | null>(null);

    const fetchBorrowings = () => {
        setLoadingBorrowings(true);
        borrowingsAPI.getAll()
            .then(res => setBorrowings(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoadingBorrowings(false));
    };

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBorrowing) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Harap unggah file foto/gambar.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Ukuran foto maksimal 5MB.' });
            return;
        }

        setUploadingId(selectedBorrowing.id);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/borrowings/${selectedBorrowing.id}/proof`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ type: selectedBorrowing.type, proofData: base64 })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setMessage({ type: 'success', text: 'Bukti berhasil diunggah! Menunggu konfirmasi admin.' });
                    fetchBorrowings();
                } else {
                    setMessage({ type: 'error', text: data.message || 'Gagal mengunggah bukti.' });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Gagal terhubung ke server.' });
            } finally {
                setUploadingId(null);
                setSelectedBorrowing(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (cameraInputRef.current) cameraInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const openUploadSelector = (id: number, type: 'pickup' | 'return') => {
        setSelectedBorrowing({ id, type });
        // Instead of directly clicking, we'll just show the buttons in the UI row
        fileInputRef.current?.click();
    };

    const openCameraSelector = (id: number, type: 'pickup' | 'return') => {
        setSelectedBorrowing({ id, type });
        cameraInputRef.current?.click();
    };

    const filteredBorrowings = borrowings.filter(b => {
        if (activeTab === 'ongoing') return ['pending', 'approved', 'borrowed'].includes(b.status);
        if (activeTab === 'completed') return ['returned', 'rejected'].includes(b.status);
        return true;
    });

    return (
        <AuthGuard>
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <div className="page-header animate-in">
                        <h1>Peminjaman & Riwayat</h1>
                        <p>Kelola dan unggah bukti peminjaman buku Anda</p>
                    </div>

                    {message && (
                        <div style={{
                            padding: '1rem', borderRadius: 12, marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* Hidden Inputs */}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <button onClick={() => setActiveTab('ongoing')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'ongoing' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'ongoing' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Sedang Berjalan</button>
                            <button onClick={() => setActiveTab('completed')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'completed' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'completed' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Selesai</button>
                            <button onClick={() => setActiveTab('all')} style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'all' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'all' ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Semua</button>
                        </div>

                        {loadingBorrowings ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}><Loader2 className="spin" size={24} style={{ margin: '0 auto 10px', display: 'block' }} />Memuat...</div>
                        ) : filteredBorrowings.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada data peminjaman di kategori ini.</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            {['Buku', 'Tanggal/Status', 'Bukti Pengambilan', 'Bukti Pengembalian'].map(h => (
                                                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBorrowings.map((b: any) => {
                                            let badgeBg = 'rgba(245,158,11,0.12)';
                                            let badgeColor = '#f59e0b';
                                            let statusLabel = 'Menunggu';
                                            if (b.status === 'approved') { badgeBg = 'rgba(59,130,246,0.12)'; badgeColor = '#3b82f6'; statusLabel = 'Disetujui'; }
                                            if (b.status === 'borrowed') { badgeBg = 'rgba(139,92,246,0.12)'; badgeColor = '#8b5cf6'; statusLabel = 'Dipinjam'; }
                                            if (b.status === 'returned') { badgeBg = 'rgba(34,197,94,0.12)'; badgeColor = '#22c55e'; statusLabel = 'Dikembalikan'; }
                                            if (b.status === 'rejected') { badgeBg = 'rgba(239,68,68,0.12)'; badgeColor = '#ef4444'; statusLabel = 'Ditolak'; }

                                            return (
                                                <tr key={b.id} onClick={() => router.push(`/pengguna/peminjaman/${b.id}`)} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s', cursor: 'pointer' }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '14px 16px', maxWidth: 250 }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            {b.book_title}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.book_author || '—'}</div>
                                                        {b.admin_notes && <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 4 }}>Note: {b.admin_notes}</div>}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', minWidth: 160 }}>
                                                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: badgeBg, color: badgeColor, display: 'inline-block', marginBottom: 8 }}>
                                                            {statusLabel}
                                                        </span>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{
                                                            b.status === 'pending' ? 'Diajukan Pada:' :
                                                                b.status === 'approved' ? 'Disetujui Pada:' :
                                                                    b.status === 'borrowed' ? 'Tenggat Kembali:' :
                                                                        b.status === 'returned' ? 'Dikembalikan:' : 'Diajukan Pada:'
                                                        }</div>
                                                        <div style={{ fontSize: '0.8rem', color: b.status === 'borrowed' ? '#f59e0b' : 'var(--text-primary)', fontWeight: 600 }}>{
                                                            b.status === 'pending' && b.request_date ? new Date(b.request_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                                                b.status === 'approved' && b.approved_date ? new Date(b.approved_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                                                    b.status === 'borrowed' && b.due_date ? new Date(b.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                                                        b.status === 'returned' && b.return_date ? new Date(b.return_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                                                            b.request_date ? new Date(b.request_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
                                                        }</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {b.pickup_proof ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <Image src={b.pickup_proof} alt="Proof" width={40} height={40} style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                                                                {b.status === 'approved' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Menunggu divalidasi</span>}
                                                            </div>
                                                        ) : b.status === 'approved' ? (
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button onClick={(e) => { e.stopPropagation(); openUploadSelector(b.id, 'pickup'); }} disabled={uploadingId === b.id} className="btn-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Upload size={14} /> File
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); openCameraSelector(b.id, 'pickup'); }} disabled={uploadingId === b.id} className="btn-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Camera size={14} /> Foto
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum tersedia</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        {b.return_proof ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <Image src={b.return_proof} alt="Proof" width={40} height={40} style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                                                                {b.status === 'borrowed' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Menunggu divalidasi</span>}
                                                            </div>
                                                        ) : b.status === 'borrowed' ? (
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button onClick={(e) => { e.stopPropagation(); openUploadSelector(b.id, 'return'); }} disabled={uploadingId === b.id} className="btn-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Upload size={14} /> File
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); openCameraSelector(b.id, 'return'); }} disabled={uploadingId === b.id} className="btn-sm" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Camera size={14} /> Foto
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum tersedia</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <style jsx>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        </AuthGuard>
    );
}
