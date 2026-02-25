'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { booksAPI, borrowingsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Download, Calendar, User, Building, Tag, FileText, ArrowLeft, Bookmark, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Book, BookCard } from '@/components/BookCard';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [related, setRelated] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [mainImgError, setMainImgError] = useState(false);
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    const [borrowNotes, setBorrowNotes] = useState('');
    const [borrowStatus, setBorrowStatus] = useState<{ loading: boolean; error: string | null; success: string | null }>({
        loading: false, error: null, success: null
    });

    useEffect(() => {
        if (!params.id) return;
        setLoading(true);
        booksAPI.getById(Number(params.id))
            .then(res => { setBook(res.data.data || res.data); })
            .catch(() => setBook(null))
            .finally(() => setLoading(false));

        booksAPI.getRecommendations(Number(params.id))
            .then(res => setRelated((res.data.data || []).slice(0, 5)))
            .catch(() => setRelated([]));
    }, [params.id]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh' }}>
                <Navbar />
                <div className="page-container">
                    <div className="book-detail">
                        <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
                        <div>
                            <div className="skeleton" style={{ height: 32, width: '70%', marginBottom: 20 }} />
                            <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 32 }} />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ height: 16, marginBottom: 16 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div style={{ minHeight: '100vh' }}>
                <Navbar />
                <div className="page-container">
                    <div className="empty-state" style={{ paddingTop: 80 }}>
                        <div className="icon"><BookOpen size={48} /></div>
                        <h3>Buku tidak ditemukan</h3>
                        <p>Buku yang Anda cari tidak tersedia</p>
                        <Link href="/books" className="btn btn-primary" style={{ marginTop: 24 }}>
                            <ArrowLeft size={16} /> Kembali ke Katalog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const metaItems = [
        { icon: User, label: 'Penulis', value: book.author },
        { icon: Building, label: 'Penerbit', value: book.publisher },
        { icon: Calendar, label: 'Tahun', value: book.year },
        { icon: Tag, label: 'Bidang', value: book.field_type },
        { icon: FileText, label: 'Subjek', value: book.subject },
        { icon: FileText, label: 'ISBN', value: book.isbn },
        { icon: FileText, label: 'Halaman', value: book.page_count ? `${book.page_count} halaman` : null },
    ].filter(m => m.value);

    const handleAction = (actionValue: string | (() => void)) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (typeof actionValue === 'string') {
            window.open(actionValue, '_blank');
        } else {
            actionValue();
        }
    };

    const handleBorrowSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!book) return;
        setBorrowStatus({ loading: true, error: null, success: null });
        try {
            await borrowingsAPI.request(book.id, borrowNotes);
            setBorrowStatus({ loading: false, error: null, success: 'Permintaan peminjaman berhasil dikirim. Menunggu persetujuan admin.' });
            setBorrowNotes('');
            setTimeout(() => setBorrowModalOpen(false), 2500);
        } catch (err: any) {
            setBorrowStatus({ loading: false, error: err.response?.data?.message || 'Gagal mengajukan peminjaman', success: null });
        }
    };

    const coverUrl = book?.cover?.startsWith('http')
        ? book.cover
        : book?.cover
            ? `https://perpustakaan-jdih-backend-production.up.railway.app${book.cover.startsWith('/') ? '' : '/'}${book.cover}`
            : '';

    const fileUrl = book?.file_url?.startsWith('http')
        ? book.file_url
        : book?.file_url
            ? `https://perpustakaan-jdih-backend-production.up.railway.app${book.file_url.startsWith('/') ? '' : '/'}${book.file_url}`
            : null;

    const getCoverStyle = (book: Book) => {
        const seedText = book.field_type || book.title || "Umum";
        let hash = 0;
        for (let i = 0; i < seedText.length; i++) {
            hash = seedText.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIndex = Math.abs(hash) % 7;

        const gradients = [
            'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue
            'linear-gradient(135deg, #831843 0%, #be185d 100%)', // Pink/Red
            'linear-gradient(135deg, #14532d 0%, #16a34a 100%)', // Green
            'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', // Purple
            'linear-gradient(135deg, #9a3412 0%, #f97316 100%)', // Orange
            'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)', // Teal
            'linear-gradient(135deg, #374151 0%, #6b7280 100%)', // Gray
        ];

        return {
            background: gradients[colorIndex],
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            padding: '24px',
            color: 'white',
            boxSizing: 'border-box' as const,
        };
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            <div className="page-container">
                {/* Back Link */}
                <Link href="/books" className="btn btn-ghost" style={{ marginBottom: 24, padding: '6px 0' }}>
                    <ArrowLeft size={16} /> Kembali ke Katalog
                </Link>

                {/* Book Detail */}
                <div className="book-detail animate-in">
                    <div className="book-detail-cover">
                        {coverUrl && !mainImgError ? (
                            <img src={coverUrl} alt={book.title} onError={() => setMainImgError(true)} />
                        ) : (
                            <div className="virtual-cover" style={getCoverStyle(book)}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontFamily: 'var(--font-serif)',
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                }}>
                                    {book.title}
                                </div>

                                <div>
                                    <div style={{ width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)', margin: '16px 0' }} />
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: 'rgba(255,255,255,0.85)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 600,
                                    }}>
                                        {book.author || 'JDIH Sumedang'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="book-detail-info">
                        <h1>{book.title}</h1>

                        {book.description && (
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                                {book.description}
                            </p>
                        )}

                        {metaItems.map((item, i) => (
                            <div key={i} className="meta-row">
                                <div className="meta-label">
                                    <item.icon size={16} /> {item.label}
                                </div>
                                <div className="meta-value">{item.value}</div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleAction(() => {
                                    setBorrowStatus({ loading: false, error: null, success: null });
                                    setBorrowModalOpen(true);
                                })}
                                className="btn btn-primary btn-lg"
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <Bookmark size={18} /> Pinjam Buku
                            </button>

                            {fileUrl ? (
                                <button
                                    onClick={() => handleAction(fileUrl)}
                                    className="btn btn-outline btn-lg"
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="btn btn-outline btn-lg"
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5, cursor: 'not-allowed' }}
                                    title="File PDF tidak tersedia untuk buku ini"
                                >
                                    <Download size={18} /> PDF Tidak Tersedia
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Books */}
                {related.length > 0 && (
                    <div className="related-section">
                        <span className="section-label">Buku Terkait</span>
                        <h2 style={{ marginTop: 8 }}>Rekomendasi untuk Anda</h2>

                        <div className="book-grid" style={{ marginTop: 32 }}>
                            {related.map((r) => (
                                <BookCard key={r.id} book={r} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <footer className="site-footer">
                © 2026 Perpustakaan JDIH Kabupaten Sumedang
            </footer>
            {/* Borrow Modal */}
            {borrowModalOpen && book && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
                }} onClick={() => setBorrowModalOpen(false)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                        borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440,
                        animation: 'fadeSlideDown 0.2s ease', position: 'relative'
                    }}>
                        <button onClick={() => setBorrowModalOpen(false)} style={{
                            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                        }}><X size={20} /></button>

                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                            Pinjam Buku
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Anda akan meminjam: <strong style={{ color: 'var(--text-primary)' }}>{book.title}</strong>
                        </p>

                        {borrowStatus.error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 8, fontSize: '0.9rem', alignItems: 'center' }}>
                                <AlertCircle size={18} /> {borrowStatus.error}
                            </div>
                        )}

                        {borrowStatus.success && (
                            <div style={{ padding: '12px 16px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 12, marginBottom: 16, display: 'flex', gap: 8, fontSize: '0.9rem', alignItems: 'center' }}>
                                <CheckCircle size={18} /> {borrowStatus.success}
                            </div>
                        )}

                        {!borrowStatus.success && (
                            <form onSubmit={handleBorrowSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Catatan / Keperluan (Opsional)
                                    </label>
                                    <textarea
                                        value={borrowNotes}
                                        onChange={e => setBorrowNotes(e.target.value)}
                                        placeholder="Misal: Untuk keperluan riset skripsi..."
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--glass-border)',
                                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', minHeight: 100,
                                            fontFamily: 'inherit', resize: 'vertical'
                                        }}
                                    />
                                </div>
                                <button type="submit" disabled={borrowStatus.loading} className="btn-primary" style={{
                                    width: '100%', padding: '12px', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: '1rem', cursor: borrowStatus.loading ? 'not-allowed' : 'pointer', opacity: borrowStatus.loading ? 0.7 : 1
                                }}>
                                    {borrowStatus.loading ? 'Memproses...' : 'Ajukan Peminjaman'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
