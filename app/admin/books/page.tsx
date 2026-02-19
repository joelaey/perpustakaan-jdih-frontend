'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { booksAPI } from '@/lib/api';
import {
    Search, Plus, Edit3, Trash2, BookOpen, ChevronLeft, ChevronRight,
    AlertCircle, CheckCircle2,
} from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    year: number;
    field_type: string;
    created_at: string;
}

interface Meta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

function AdminBooksContent() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [meta, setMeta] = useState<Meta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await booksAPI.getAll({ page, limit: 15, search });
            setBooks(res.data.data || []);
            setMeta(res.data.meta || { current_page: 1, per_page: 15, total: 0, last_page: 1 });
        } catch {
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus buku ini?')) return;
        setDeleting(id);
        try {
            await booksAPI.delete(id);
            setToast({ type: 'success', message: 'Buku berhasil dihapus' });
            fetchBooks();
        } catch {
            setToast({ type: 'error', message: 'Gagal menghapus buku' });
        } finally {
            setDeleting(null);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchBooks();
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />

            <div className="dashboard-layout">
                <div className="dashboard-content">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                        <div className="page-header" style={{ marginBottom: 0 }}>
                            <h1>📚 Kelola Buku</h1>
                            <p>Manajemen koleksi buku perpustakaan</p>
                        </div>
                        <Link href="/admin/tambah-buku" className="btn btn-primary">
                            <Plus size={18} /> Tambah Buku
                        </Link>
                    </div>

                    {/* Toast */}
                    {toast && (
                        <div style={{
                            position: 'fixed', top: 88, right: 24, zIndex: 9999,
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 12,
                            background: toast.type === 'success' ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)',
                            border: `1px solid ${toast.type === 'success' ? 'rgba(22,163,74,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            color: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            fontSize: '0.875rem', fontWeight: 500,
                            animation: 'fadeIn 0.3s ease',
                        }}>
                            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {toast.message}
                        </div>
                    )}

                    {/* Search */}
                    <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
                        <div className="search-bar">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Cari buku..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary btn-sm">
                                Cari
                            </button>
                        </div>
                    </form>

                    {/* Info */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                        Total: {meta.total} buku
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Judul</th>
                                    <th>Penulis</th>
                                    <th>Bidang</th>
                                    <th>Tahun</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6}>
                                                <div className="skeleton" style={{ height: 20 }} />
                                            </td>
                                        </tr>
                                    ))
                                ) : books.length > 0 ? (
                                    books.map((book, i) => (
                                        <tr key={book.id}>
                                            <td style={{ color: 'var(--text-muted)', width: 50 }}>
                                                {(page - 1) * 15 + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: 400 }}>
                                                    <Link
                                                        href={`/books/${book.id}`}
                                                        style={{
                                                            color: 'var(--text-primary)',
                                                            textDecoration: 'none',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {book.title}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {book.author || '-'}
                                            </td>
                                            <td>
                                                {book.field_type && (
                                                    <span className="badge badge-admin">{book.field_type}</span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {book.year || '-'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => router.push(`/admin/edit-buku/${book.id}`)}
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(book.id)}
                                                        disabled={deleting === book.id}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                                            <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                            <div>Tidak ada buku ditemukan</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="pagination">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 8px' }}>
                                {page} / {meta.last_page}
                            </span>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AdminBooksPage() {
    return (
        <AuthGuard requireAdmin>
            <AdminBooksContent />
        </AuthGuard>
    );
}
