'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { booksAPI, BookQueryParams } from '@/lib/api';
import { Search, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    year: number;
    field_type: string;
    cover: string;
    subject: string;
}

interface Meta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export default function BooksPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
                <Navbar />
                <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    <div className="book-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="book-card">
                                <div className="skeleton" style={{ height: 200 }} />
                                <div style={{ padding: 16 }}>
                                    <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        }>
            <BooksContent />
        </Suspense>
    );
}

function BooksContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [books, setBooks] = useState<Book[]>([]);
    const [meta, setMeta] = useState<Meta>({ current_page: 1, per_page: 12, total: 0, last_page: 1 });
    const [fieldTypes, setFieldTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const fieldType = searchParams.get('field_type') || '';

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params: BookQueryParams = { page, limit: 12 };
            if (search) params.search = search;
            if (fieldType) params.field_type = fieldType;

            const res = await booksAPI.getAll(params);
            setBooks(res.data.data || []);
            setMeta(res.data.meta || { current_page: 1, per_page: 12, total: 0, last_page: 1 });
        } catch {
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, fieldType]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        booksAPI.getFieldTypes().then((res) => {
            setFieldTypes(res.data.data || []);
        }).catch(() => { });
    }, []);

    const updateQuery = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        if (updates.search !== undefined || updates.field_type !== undefined) {
            params.delete('page');
        }
        router.push(`/books?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateQuery({ search: searchInput });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                {/* Header */}
                <div className="page-header animate-in">
                    <h1>📚 Katalog Buku Hukum</h1>
                    <p>Jelajahi koleksi buku hukum Perpustakaan JDIH Kabupaten Sumedang</p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
                    <div className="search-bar">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cari buku berdasarkan judul, penulis, subjek..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                            Cari
                        </button>
                    </div>
                </form>

                {/* Filter Chips */}
                <div className="filter-chips">
                    <button
                        className={`filter-chip ${!fieldType ? 'active' : ''}`}
                        onClick={() => updateQuery({ field_type: '' })}
                    >
                        <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        Semua
                    </button>
                    {fieldTypes.slice(0, 10).map((ft) => (
                        <button
                            key={ft}
                            className={`filter-chip ${fieldType === ft ? 'active' : ''}`}
                            onClick={() => updateQuery({ field_type: ft })}
                        >
                            {ft}
                        </button>
                    ))}
                </div>

                {/* Results Info */}
                <div style={{
                    fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20,
                }}>
                    {loading ? 'Memuat...' : `${meta.total} buku ditemukan`}
                    {search && ` untuk "${search}"`}
                    {fieldType && ` — ${fieldType}`}
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="book-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="book-card">
                                <div className="skeleton" style={{ height: 200 }} />
                                <div style={{ padding: 16 }}>
                                    <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : books.length > 0 ? (
                    <div className="book-grid">
                        {books.map((book) => (
                            <Link href={`/books/${book.id}`} key={book.id} className="book-card animate-in">
                                <div className="book-cover">
                                    {book.cover ? (
                                        <img src={book.cover} alt={book.title} loading="lazy" />
                                    ) : (
                                        <div className="no-cover">
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                </div>
                                <div className="book-info">
                                    <div className="book-title">{book.title}</div>
                                    <div className="book-author">
                                        {book.author || 'Penulis tidak diketahui'}
                                    </div>
                                    <div className="book-meta">
                                        {book.year && <span className="tag">{book.year}</span>}
                                        {book.field_type && <span className="tag">{book.field_type}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon"><BookOpen size={48} /></div>
                        <h3>Tidak ada buku ditemukan</h3>
                        <p>Coba ubah kata kunci pencarian atau filter yang digunakan</p>
                    </div>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="pagination">
                        <button
                            disabled={page <= 1}
                            onClick={() => updateQuery({ page: String(page - 1) })}
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                            let p: number;
                            if (meta.last_page <= 5) {
                                p = i + 1;
                            } else if (page <= 3) {
                                p = i + 1;
                            } else if (page >= meta.last_page - 2) {
                                p = meta.last_page - 4 + i;
                            } else {
                                p = page - 2 + i;
                            }
                            return (
                                <button
                                    key={p}
                                    className={page === p ? 'active' : ''}
                                    onClick={() => updateQuery({ page: String(p) })}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        <button
                            disabled={page >= meta.last_page}
                            onClick={() => updateQuery({ page: String(page + 1) })}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
