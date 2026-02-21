'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Download, Calendar, User, Building, Tag, FileText, ArrowLeft, Bookmark } from 'lucide-react';
import { Book, BookCard } from '@/components/BookCard';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [related, setRelated] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [mainImgError, setMainImgError] = useState(false);

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
            actionValue(); // Example borrowing logic action here
            alert("Fitur peminjaman sedang dalam pengembangan.");
        }
    };

    const mainCoverUrl = book.cover?.startsWith('http')
        ? book.cover
        : book.cover
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${book.cover.startsWith('/') ? '' : '/'}${book.cover}`
            : '';

    const pdfUrl = book.file_url?.startsWith('http')
        ? book.file_url
        : book.file_url
            ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${book.file_url.startsWith('/') ? '' : '/'}${book.file_url}`
            : '';

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
                        {mainCoverUrl && !mainImgError ? (
                            <img src={mainCoverUrl} alt={book.title} onError={() => setMainImgError(true)} />
                        ) : (
                            <div className="no-cover" style={{ width: '100%', height: '100%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={64} style={{ color: 'var(--text-muted)' }} />
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
                                onClick={() => handleAction(() => { })}
                                className="btn btn-primary btn-lg"
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <Bookmark size={18} /> Pinjam Buku
                            </button>

                            {pdfUrl ? (
                                <button
                                    onClick={() => handleAction(pdfUrl)}
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
        </div>
    );
}
