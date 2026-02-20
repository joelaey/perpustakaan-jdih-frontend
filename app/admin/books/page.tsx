'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import { Search, Plus, Trash2, Edit, BookOpen, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

interface Book {
    id: number; title: string; author: string; publisher: string;
    year: number; field_type: string;
}

interface Meta {
    current_page: number; per_page: number; total: number; last_page: number;
}

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [meta, setMeta] = useState<Meta>({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchBooks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await booksAPI.getAll({ page, limit: 15, search: search || undefined });
            setBooks(res.data.data || []);
            setMeta(res.data.meta || { current_page: 1, per_page: 15, total: 0, last_page: 1 });
        } catch {
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await booksAPI.delete(deleteId);
            setToast({ type: 'success', message: 'Buku berhasil dihapus' });
            setDeleteId(null);
            fetchBooks();
        } catch {
            setToast({ type: 'error', message: 'Gagal menghapus buku' });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchBooks();
    };

    return (
        <AuthGuard requireAdmin>
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                        <div className="page-header" style={{ marginBottom: 0 }}>
                            <h1>Kelola Buku</h1>
                            <p>{meta.total} buku dalam koleksi</p>
                        </div>
                        <Link href="/admin/tambah-buku" className="btn btn-primary">
                            <Plus size={16} /> Tambah Buku
                        </Link>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Cari buku..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary btn-sm">Cari</button>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>Penulis</th>
                                    <th>Penerbit</th>
                                    <th>Tahun</th>
                                    <th>Bidang</th>
                                    <th style={{ width: 120 }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : books.length > 0 ? (
                                    books.map((book) => (
                                        <tr key={book.id}>
                                            <td style={{ fontWeight: 600, maxWidth: 300 }}>
                                                <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {book.title}
                                                </div>
                                            </td>
                                            <td>{book.author || '—'}</td>
                                            <td>{book.publisher || '—'}</td>
                                            <td>{book.year || '—'}</td>
                                            <td>
                                                {book.field_type && (
                                                    <span className="badge badge-admin">{book.field_type}</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <Link href={`/admin/edit-buku/${book.id}`} className="btn btn-ghost btn-sm" title="Edit">
                                                        <Edit size={14} />
                                                    </Link>
                                                    <button onClick={() => setDeleteId(book.id)} className="btn btn-danger btn-sm" title="Hapus">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                            <BookOpen size={32} style={{ marginBottom: 8, opacity: 0.4 }} /><br />
                                            Tidak ada buku ditemukan
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
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(5, meta.last_page) }, (_, i) => {
                                let p: number;
                                if (meta.last_page <= 5) p = i + 1;
                                else if (page <= 3) p = i + 1;
                                else if (page >= meta.last_page - 2) p = meta.last_page - 4 + i;
                                else p = page - 2 + i;
                                return (
                                    <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                                        {p}
                                    </button>
                                );
                            })}
                            <button disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation */}
                {deleteId && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24,
                    }}>
                        <div style={{
                            background: 'var(--background)', border: '1px solid var(--border)',
                            padding: 32, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)',
                        }}>
                            <h3 style={{ marginBottom: 12 }}>Hapus Buku?</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: 24 }}>
                                Buku akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button onClick={() => setDeleteId(null)} className="btn btn-outline">Batal</button>
                                <button onClick={handleDelete} className="btn btn-primary" style={{ background: 'var(--danger)' }}>Hapus</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div style={{
                        position: 'fixed', bottom: 24, right: 24, padding: '12px 20px',
                        background: toast.type === 'success' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                        border: `1px solid ${toast.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                        color: toast.type === 'success' ? 'var(--success)' : 'var(--danger)',
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
                        fontWeight: 600, zIndex: 9999, boxShadow: 'var(--shadow-md)',
                    }}>
                        {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {toast.message}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
