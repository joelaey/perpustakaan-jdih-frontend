'use client';

import { useState, useEffect, use } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import { BookForm } from '@/app/admin/tambah-buku/page';
import { Loader2 } from 'lucide-react';

export default function EditBukuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [book, setBook] = useState<Record<string, string | number | null> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await booksAPI.getById(parseInt(id));
                setBook(res.data.data);
            } catch {
                setError('Buku tidak ditemukan');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading) {
        return (
            <AuthGuard requireAdmin>
                <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                    <Navbar />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '8rem', color: 'var(--text-muted)', gap: 10 }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Memuat data buku...
                    </div>
                </div>
                <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </AuthGuard>
        );
    }

    if (error || !book) {
        return (
            <AuthGuard requireAdmin>
                <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                    <Navbar />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '8rem', color: '#ef4444' }}>
                        {error || 'Buku tidak ditemukan'}
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requireAdmin>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <BookForm mode="edit" bookId={parseInt(id)} initialData={book} />
            </div>
        </AuthGuard>
    );
}
