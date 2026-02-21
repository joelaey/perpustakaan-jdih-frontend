'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI } from '@/lib/api';
import { BookOpen, BookMarked, Download, Clock, Search, ExternalLink } from 'lucide-react';

export default function UserDashboard() {
    const { user } = useAuth();
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [loadingBorrowings, setLoadingBorrowings] = useState(true);

    React.useEffect(() => {
        borrowingsAPI.getAll()
            .then(res => setBorrowings(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoadingBorrowings(false));
    }, []);

    const currentlyBorrowed = borrowings.filter(b => b.status === 'borrowed').length;

    const stats = [
        { label: 'Koleksi Tersedia', value: '2,458', icon: BookOpen, color: 'red' },
        { label: 'Sedang Dipinjam', value: currentlyBorrowed.toString(), icon: BookMarked, color: 'blue' },
        { label: 'Total Download', value: '24', icon: Download, color: 'purple' },
        { label: 'Riwayat Pinjam', value: borrowings.length.toString(), icon: Clock, color: 'green' },
    ];

    const quickActions = [
        {
            title: 'Cari Buku Hukum',
            description: 'Cari & pinjam buku hukum',
            icon: Search,
            color: 'var(--accent-bg)',
            iconColor: 'var(--accent)',
            href: '/books',
        },
        {
            title: 'Download Dokumen',
            description: 'Unduh Perda, Perbup, SK',
            icon: Download,
            color: 'var(--accent-bg)',
            iconColor: 'var(--accent)',
            href: '/books',
        },
        {
            title: 'Buku Dipinjam',
            description: 'Penelusuran status peminjaman',
            icon: BookMarked,
            color: 'rgba(59, 130, 246, 0.08)',
            iconColor: '#3b82f6',
            href: '#riwayat',
        },
    ];

    return (
        <AuthGuard>
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <div className="page-header animate-in">
                        <h1>Selamat Datang, {user?.name || 'Pengguna'}</h1>
                        <p>Dashboard Perpustakaan JDIH Sumedang</p>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid animate-in">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <div className={`stat-icon ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Section Divider */}
                    <div style={{ marginBottom: 32 }}>
                        <span className="section-label">Aksi Cepat</span>
                        <div className="section-divider" style={{ marginTop: 8 }} />
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        {quickActions.map((action) => (
                            <Link key={action.title} href={action.href} className="quick-action-card">
                                <div className="icon" style={{ background: action.color, color: action.iconColor }}>
                                    <action.icon size={22} />
                                </div>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section Divider */}
                <div id="riwayat" style={{ marginBottom: 24, marginTop: 48 }}>
                    <span className="section-label">Riwayat Peminjaman Saya</span>
                    <div className="section-divider" style={{ marginTop: 8 }} />
                </div>

                {/* Borrowing History */}
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
                    {loadingBorrowings ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat riwayat...</div>
                    ) : borrowings.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Anda belum mengajukan peminjaman buku apapun.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                        {['Buku', 'Tanggal Pengajuan', 'Status', 'Catatan Admin'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {borrowings.map((b: any) => {
                                        let badgeBg = 'rgba(245,158,11,0.12)';
                                        let badgeColor = '#f59e0b';
                                        let statusLabel = 'Menunggu';
                                        if (b.status === 'approved') { badgeBg = 'rgba(59,130,246,0.12)'; badgeColor = '#3b82f6'; statusLabel = 'Disetujui'; }
                                        if (b.status === 'borrowed') { badgeBg = 'rgba(139,92,246,0.12)'; badgeColor = '#8b5cf6'; statusLabel = 'Dipinjam'; }
                                        if (b.status === 'returned') { badgeBg = 'rgba(34,197,94,0.12)'; badgeColor = '#22c55e'; statusLabel = 'Dikembalikan'; }
                                        if (b.status === 'rejected') { badgeBg = 'rgba(239,68,68,0.12)'; badgeColor = '#ef4444'; statusLabel = 'Ditolak'; }

                                        return (
                                            <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}>
                                                <td style={{ padding: '14px 16px', maxWidth: 250 }}>
                                                    <Link href={`/books/${b.book_id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                                                        {b.book_title} <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                                                    </Link>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.book_author || '—'}</div>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(b.request_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, background: badgeBg, color: badgeColor }}>
                                                        {statusLabel}
                                                    </span>
                                                    {b.due_date && b.status === 'borrowed' && (
                                                        <div style={{ fontSize: '0.75rem', color: new Date(b.due_date) < new Date() ? '#ef4444' : 'var(--text-muted)', marginTop: 6 }}>
                                                            Sikap: {new Date(b.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {b.admin_notes || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
