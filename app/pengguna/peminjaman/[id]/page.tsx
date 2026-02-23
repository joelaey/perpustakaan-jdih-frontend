'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI } from '@/lib/api';
import { ArrowLeft, BookOpen, CheckCircle, AlertCircle, Upload, Camera } from 'lucide-react';

export default function PenggunaPeminjamanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const [selectedBorrowing, setSelectedBorrowing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<'pickup' | 'return' | null>(null);

    const fetchDetail = () => {
        if (!params.id) return;
        setLoading(true);
        borrowingsAPI.getById(Number(params.id))
            .then(res => {
                setSelectedBorrowing(res.data.data);
            })
            .catch(err => {
                console.error(err);
                setMessage({ type: 'error', text: 'Gagal memuat detail peminjaman' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchDetail();
    }, [params.id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedBorrowing || !uploadType) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Harap unggah file foto.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Ukuran maksimal foto 5MB.' });
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
                    body: JSON.stringify({ type: uploadType, proofData: base64 })
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    setMessage({ type: 'success', text: 'Bukti berhasil diunggah! Menunggu konfirmasi admin.' });
                    fetchDetail(); // Reload latest
                } else {
                    setMessage({ type: 'error', text: data.message || 'Gagal mengunggah bukti.' });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Gagal terhubung ke server.' });
            } finally {
                setUploadingId(null);
                setUploadType(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (cameraInputRef.current) cameraInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    const openUploadSelector = (type: 'pickup' | 'return') => {
        setUploadType(type);
        fileInputRef.current?.click();
    };

    const openCameraSelector = (type: 'pickup' | 'return') => {
        setUploadType(type);
        cameraInputRef.current?.click();
    };

    return (
        <AuthGuard>
            <div className="dashboard-layout" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />

                {/* Hidden Inputs for User Proof Upload */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />

                <main className="dashboard-content" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href="/pengguna/peminjaman" className="btn btn-ghost" style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <ArrowLeft size={18} /> Kembali
                        </Link>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Detail Peminjaman Saya
                        </h1>
                    </div>

                    {message && (
                        <div style={{
                            padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8,
                            background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat...</div>
                    ) : !selectedBorrowing ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Data tidak ditemukan</div>
                    ) : (
                        <div style={{
                            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            borderRadius: 20, padding: '2rem', animation: 'fadeSlideDown 0.3s ease'
                        }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Buku</span>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ width: 40, height: 56, borderRadius: 6, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                                                {selectedBorrowing.book_cover ? (
                                                    <img src={selectedBorrowing.book_cover.startsWith('http') ? selectedBorrowing.book_cover : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${selectedBorrowing.book_cover.startsWith('/') ? '' : '/'}${selectedBorrowing.book_cover}`} alt={selectedBorrowing.book_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><BookOpen size={16} color="var(--text-muted)" /></div>}
                                            </div>
                                            <div>
                                                <Link href={`/buku/${selectedBorrowing.book_id}`} style={{ color: 'var(--text-primary)', display: 'block', lineHeight: 1.3, fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                                                    {selectedBorrowing.book_title}
                                                </Link>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Oleh {selectedBorrowing.book_author || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Status Terkini</span>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'inline-block',
                                            background: selectedBorrowing.status === 'approved' ? 'rgba(59,130,246,0.1)' : selectedBorrowing.status === 'borrowed' ? 'rgba(139,92,246,0.1)' : selectedBorrowing.status === 'returned' ? 'rgba(34,197,94,0.1)' : selectedBorrowing.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: selectedBorrowing.status === 'approved' ? '#3b82f6' : selectedBorrowing.status === 'borrowed' ? '#8b5cf6' : selectedBorrowing.status === 'returned' ? '#22c55e' : selectedBorrowing.status === 'rejected' ? '#ef4444' : '#f59e0b', marginTop: 4
                                        }}>
                                            {selectedBorrowing.status === 'pending' ? 'Menunggu Persetujuan' :
                                                selectedBorrowing.status === 'approved' ? 'Disetujui Admin (Siap Diambil)' :
                                                    selectedBorrowing.status === 'borrowed' ? 'Sedang Dipinjam' :
                                                        selectedBorrowing.status === 'returned' ? 'Selesai Dikembalikan' : 'Ditolak'}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Tgl. Pengajuan</span>
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, display: 'inline-block', marginTop: 4 }}>
                                            {new Date(selectedBorrowing.request_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    {selectedBorrowing.approved_date && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Tgl. Disetujui</span>
                                            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, display: 'inline-block', marginTop: 4 }}>
                                                {new Date(selectedBorrowing.approved_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    {selectedBorrowing.borrow_date && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Tgl. Diambil</span>
                                            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, display: 'inline-block', marginTop: 4 }}>
                                                {new Date(selectedBorrowing.borrow_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    {selectedBorrowing.due_date && ['approved', 'borrowed'].includes(selectedBorrowing.status) && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'block', marginBottom: 2 }}>Tenggat Kembali</span>
                                            <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                                                {new Date(selectedBorrowing.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    {selectedBorrowing.return_date && (
                                        <div>
                                            <span style={{ fontSize: '0.8rem', color: '#22c55e', display: 'block', marginBottom: 2 }}>Tgl. Dikembalikan</span>
                                            <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                                                {new Date(selectedBorrowing.return_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 20 }}>
                                    {/* Proof display & Upload Toggles */}
                                    <div style={{ flex: '1 1 250px', background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bukti Pengambilan Saya</div>
                                        {selectedBorrowing.pickup_proof ? (
                                            <div onClick={() => setSelectedImage(selectedBorrowing.pickup_proof)} style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform 0.2s', ...{ ':hover': { transform: 'scale(1.05)' } } as any }}>
                                                <img src={selectedBorrowing.pickup_proof} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Pickup proof" />
                                            </div>
                                        ) : selectedBorrowing.status === 'approved' ? (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Silahkan unggah foto agar admin dapat memvalidasi proses pe-minjaman Anda.</div>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    <button onClick={() => openUploadSelector('pickup')} className="btn-sm btn-outline" style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Upload size={16} /> Pilih File</button>
                                                    <button onClick={() => openCameraSelector('pickup')} className="btn-sm btn-outline" style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Camera size={16} /> Ambil Foto</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Tahap ini belum tersedia / belum disetujui admin.</div>
                                        )}
                                    </div>

                                    <div style={{ flex: '1 1 250px', background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bukti Pengembalian Saya</div>
                                        {selectedBorrowing.return_proof ? (
                                            <div onClick={() => setSelectedImage(selectedBorrowing.return_proof)} style={{ width: 120, height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform 0.2s', ...{ ':hover': { transform: 'scale(1.05)' } } as any }}>
                                                <img src={selectedBorrowing.return_proof} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Return proof" />
                                            </div>
                                        ) : selectedBorrowing.status === 'borrowed' ? (
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Silahkan unggah foto kondisi buku saat dikembalikan ke admin perpustakaan.</div>
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    <button onClick={() => openUploadSelector('return')} className="btn-sm btn-outline" style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Upload size={16} /> Pilih File</button>
                                                    <button onClick={() => openCameraSelector('return')} className="btn-sm btn-outline" style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Camera size={16} /> Ambil Foto</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Hanya tersedia saat buku berada di status "Sedang Dipinjam".</div>
                                        )}
                                    </div>
                                </div>

                                {selectedBorrowing.admin_notes && (
                                    <div style={{ marginTop: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 12 }}>
                                        <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'block', marginBottom: 4, fontWeight: 700 }}>Catatan Admin (Penolakan/Pesan Khusus):</span>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedBorrowing.admin_notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>

                {/* Image Zoom Modal */}
                {selectedImage && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem', backdropFilter: 'blur(5px)'
                    }} onClick={() => setSelectedImage(null)}>
                        <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                            <img src={selectedImage} alt="Zoomed proof" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
                            <button onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }} style={{
                                position: 'absolute', top: -16, right: -16, width: 32, height: 32,
                                borderRadius: '50%', background: 'white', color: 'black',
                                border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}>
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
