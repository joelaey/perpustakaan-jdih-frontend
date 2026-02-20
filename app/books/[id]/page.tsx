'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import { BookOpen, Download, Calendar, User, Building, Tag, FileText, ArrowLeft } from 'lucide-react';

interface Book {
    id: number; title: string; author: string; publisher: string;
    year: number; field_type: string; cover: string; subject: string;
    description: string; isbn: string; language: string;
    page_count: number; file_url: string;
}

export default function BookDetailPage() {
    const params = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [related, setRelated] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

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
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} />
                        ) : (
                            <BookOpen size={64} style={{ color: 'var(--text-muted)' }} />
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

                        {book.file_url && (
                            <a
                                href={book.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ marginTop: 32 }}
                            >
                                <Download size={18} /> Download PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Related Books */}
                {related.length > 0 && (
                    <div className="related-section">
                        <span className="section-label">Buku Terkait</span>
                        <h2 style={{ marginTop: 8 }}>Rekomendasi untuk Anda</h2>

                        <div className="book-grid" style={{ marginTop: 32 }}>
                            {related.map((r) => (
                                <Link href={`/books/${r.id}`} key={r.id} className="book-card">
                                    <div className="book-cover">
                                        {r.cover ? (
                                            <img src={r.cover} alt={r.title} loading="lazy" />
                                        ) : (
                                            <div className="no-cover"><BookOpen size={32} /></div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        <div className="book-title">{r.title}</div>
                                        <div className="book-author">{r.author || 'Penulis tidak diketahui'}</div>
                                    </div>
                                </Link>
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
