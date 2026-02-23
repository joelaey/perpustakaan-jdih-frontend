'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { booksAPI, BookQueryParams } from '@/lib/api';
import { Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Book, BookCard } from '@/components/BookCard';

interface Meta {
    current_page: number; per_page: number; total: number; last_page: number;
}

export default function BooksPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh' }}>
                <Navbar />
                <div className="page-container">
                    <div className="book-grid" style={{ paddingTop: 32 }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="book-card">
                                <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
                                <div style={{ paddingTop: 14 }}>
                                    <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
    const [meta, setMeta] = useState<Meta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
    const [fieldTypes, setFieldTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

    // Debounce for real-time search
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            const currentSearch = searchParams.get('search') || '';
            if (searchInput !== currentSearch) {
                const params = new URLSearchParams(searchParams.toString());
                if (searchInput) params.set('search', searchInput);
                else params.delete('search');
                params.delete('page'); // Reset pagination
                router.push(`/books?${params.toString()}`);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchInput, searchParams, router]);

    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const fieldType = searchParams.get('field_type') || '';
    const sort = searchParams.get('sort') || 'newest';

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const params: BookQueryParams = { page, limit: 15, sort };
            if (search) params.search = search;
            if (fieldType) params.field_type = fieldType;
            const res = await booksAPI.getAll(params);
            setBooks(res.data.data || []);
            setMeta(res.data.meta || { current_page: 1, per_page: 15, total: 0, last_page: 1 });
        } catch {
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, fieldType, sort]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

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
        if (updates.search !== undefined || updates.field_type !== undefined || updates.sort !== undefined) {
            params.delete('page');
        }
        router.push(`/books?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); updateQuery({ search: searchInput }); };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            <div className="page-container">
                {/* Search */}
                <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Cari buku berdasarkan judul, penulis, subjek..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Cari</button>
                    </div>
                </form>

                {/* Filter Tabs (LOA style) */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${!fieldType ? 'active' : ''}`}
                        onClick={() => updateQuery({ field_type: '' })}
                    >
                        Semua
                    </button>
                    {fieldTypes.map((ft) => (
                        <button
                            key={ft}
                            className={`filter-tab ${fieldType === ft ? 'active' : ''}`}
                            onClick={() => updateQuery({ field_type: ft })}
                        >
                            {ft}
                        </button>
                    ))}
                </div>

                {/* Sort + Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                    <div className="sort-options">
                        <span className="sort-label">Urutkan</span>
                        <button className={sort === 'newest' ? 'active' : ''} onClick={() => updateQuery({ sort: 'newest' })}>Terbaru</button>
                        <button className={sort === 'az' ? 'active' : ''} onClick={() => updateQuery({ sort: 'az' })}>Judul A-Z</button>
                        <button className={sort === 'za' ? 'active' : ''} onClick={() => updateQuery({ sort: 'za' })}>Judul Z-A</button>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {loading ? 'Memuat...' : `${meta.total} buku`}
                        {search && ` — "${search}"`}
                    </div>
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="book-grid">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="book-card">
                                <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
                                <div style={{ paddingTop: 14 }}>
                                    <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : books.length > 0 ? (
                    <div className="book-grid">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon"><BookOpen size={48} /></div>
                        <h3>Tidak ada buku ditemukan</h3>
                        <p>Coba ubah kata kunci pencarian atau filter</p>
                    </div>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div className="pagination">
                        <button disabled={page <= 1} onClick={() => updateQuery({ page: String(page - 1) })}>
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                            let p: number;
                            if (meta.last_page <= 5) p = i + 1;
                            else if (page <= 3) p = i + 1;
                            else if (page >= meta.last_page - 2) p = meta.last_page - 4 + i;
                            else p = page - 2 + i;
                            return (
                                <button key={p} className={page === p ? 'active' : ''} onClick={() => updateQuery({ page: String(p) })}>
                                    {p}
                                </button>
                            );
                        })}
                        <button disabled={page >= meta.last_page} onClick={() => updateQuery({ page: String(page + 1) })}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
