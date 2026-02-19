'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import {
    BookOpen, ArrowLeft, Download, Calendar, User as UserIcon,
    Building2, MapPin, Hash, FileText, Globe, Sparkles,
} from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    publish_place: string;
    year: number;
    isbn: string;
    subject: string;
    field_type: string;
    physical_description: string;
    language: string;
    location: string;
    file_url: string;
    cover: string;
    downloaded: number;
    view_count: number;
}

export default function BookDetailPage() {
    const params = useParams();
    const bookId = Number(params.id);
    const [book, setBook] = useState<Book | null>(null);
    const [related, setRelated] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRelated, setLoadingRelated] = useState(true);

    useEffect(() => {
        if (!bookId) return;

        setLoading(true);
        booksAPI.getById(bookId)
            .then((res) => setBook(res.data.data))
            .catch(() => setBook(null))
            .finally(() => setLoading(false));

        setLoadingRelated(true);
        booksAPI.getRecommendations(bookId)
            .then((res) => setRelated(res.data.data || []))
            .catch(() => setRelated([]))
            .finally(() => setLoadingRelated(false));
    }, [bookId]);

    const metaItems = book ? [
        { icon: UserIcon, label: 'Penulis', value: book.author },
        { icon: Building2, label: 'Penerbit', value: book.publisher },
        { icon: MapPin, label: 'Tempat Terbit', value: book.publish_place },
        { icon: Calendar, label: 'Tahun', value: book.year?.toString() },
        { icon: Hash, label: 'ISBN/ISSN', value: book.isbn },
        { icon: FileText, label: 'Subjek', value: book.subject },
        { icon: Sparkles, label: 'Bidang Hukum', value: book.field_type },
        { icon: FileText, label: 'Deskripsi Fisik', value: book.physical_description },
        { icon: Globe, label: 'Bahasa', value: book.language },
        { icon: MapPin, label: 'Lokasi', value: book.location },
    ].filter((m) => m.value) : [];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
                <Navbar />
                <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    <div className="book-detail-hero">
                        <div className="skeleton book-detail-cover" />
                        <div>
                            <div className="skeleton" style={{ height: 32, marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 20, width: '50%' }} />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!book) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
                <Navbar />
                <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    <div className="empty-state">
                        <div className="icon"><BookOpen size={48} /></div>
                        <h3>Buku tidak ditemukan</h3>
                        <p>Buku yang Anda cari tidak ada atau telah dihapus</p>
                        <Link href="/books" className="btn btn-primary" style={{ marginTop: 20 }}>
                            Kembali ke Katalog
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                {/* Back button */}
                <Link href="/books" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'var(--text-secondary)', textDecoration: 'none',
                    fontSize: '0.9rem', marginBottom: 24,
                    padding: '6px 12px', borderRadius: 8,
                    transition: 'all 0.2s ease',
                }}>
                    <ArrowLeft size={18} /> Kembali ke Katalog
                </Link>

                {/* Book Detail Hero */}
                <div className="book-detail-hero animate-in">
                    <div className="book-detail-cover">
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} />
                        ) : (
                            <BookOpen size={64} style={{ opacity: 0.2, color: 'var(--primary)' }} />
                        )}
                    </div>

                    <div className="book-detail-info">
                        <h1>{book.title}</h1>

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                            {book.field_type && (
                                <span style={{
                                    padding: '4px 12px', borderRadius: 20,
                                    background: 'rgba(249, 115, 22, 0.1)',
                                    color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600,
                                }}>
                                    {book.field_type}
                                </span>
                            )}
                            {book.year && (
                                <span style={{
                                    padding: '4px 12px', borderRadius: 20,
                                    background: 'var(--hover-bg)',
                                    color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
                                }}>
                                    {book.year}
                                </span>
                            )}
                        </div>

                        {/* Meta rows */}
                        {metaItems.map(({ icon: Icon, label, value }) => (
                            <div className="meta-row" key={label}>
                                <div className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icon size={14} /> {label}
                                </div>
                                <div className="meta-value">{value}</div>
                            </div>
                        ))}

                        {/* Download Button */}
                        {book.file_url && (
                            <a
                                href={book.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ marginTop: 24, width: '100%', maxWidth: 300 }}
                            >
                                <Download size={18} /> Download PDF
                            </a>
                        )}
                    </div>
                </div>

                {/* Related Books Section */}
                <div className="related-books-section">
                    <h2>
                        <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                        Buku Terkait
                    </h2>

                    {loadingRelated ? (
                        <div className="book-grid">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="book-card">
                                    <div className="skeleton" style={{ height: 200 }} />
                                    <div style={{ padding: 16 }}>
                                        <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                                        <div className="skeleton" style={{ height: 14, width: '60%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : related.length > 0 ? (
                        <div className="book-grid">
                            {related.map((b) => (
                                <Link href={`/books/${b.id}`} key={b.id} className="book-card">
                                    <div className="book-cover">
                                        {b.cover ? (
                                            <img src={b.cover} alt={b.title} loading="lazy" />
                                        ) : (
                                            <div className="no-cover">
                                                <BookOpen size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        <div className="book-title">{b.title}</div>
                                        <div className="book-author">{b.author || 'Penulis tidak diketahui'}</div>
                                        <div className="book-meta">
                                            {b.year && <span className="tag">{b.year}</span>}
                                            {b.field_type && <span className="tag">{b.field_type}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center', padding: '40px 20px',
                            color: 'var(--text-muted)', fontSize: '0.9rem',
                        }}>
                            Belum ada rekomendasi buku terkait
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
