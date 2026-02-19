'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
    BookOpen,
    Clock,
    ArrowRight,
    Search,
    BookMarked,
    FileText,
    Download,
    RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Koleksi Buku', value: '2,458', icon: BookOpen, color: 'orange' },
        { label: 'Sedang Dipinjam', value: '3', icon: BookMarked, color: 'blue' },
        { label: 'Total Download', value: '24', icon: Download, color: 'purple' },
        { label: 'Riwayat Pinjam', value: '12', icon: Clock, color: 'green' },
    ];

    const quickActions = [
        {
            title: 'Cari Buku Hukum',
            description: 'Cari & pinjam buku hukum',
            icon: Search,
            color: 'rgba(249, 115, 22, 0.15)',
            iconColor: 'var(--primary)',
            href: '/books',
        },
        {
            title: 'Download Dokumen',
            description: 'Unduh Perda, Perbup, SK',
            icon: Download,
            color: 'rgba(234, 88, 12, 0.15)',
            iconColor: 'var(--secondary)',
            href: '/books',
        },
        {
            title: 'Buku Dipinjam',
            description: 'Lihat buku yang sedang dipinjam',
            icon: BookMarked,
            color: 'rgba(251, 146, 60, 0.15)',
            iconColor: 'var(--accent)',
            href: '/books',
        },
        {
            title: 'Riwayat Peminjaman',
            description: 'Riwayat pinjam & pengembalian',
            icon: RotateCcw,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: 'var(--success)',
            href: '/books',
        },
    ];

    const recentBooks = [
        { id: 1, title: 'Peraturan Daerah Kabupaten Sumedang No. 1 Tahun 2024', category: 'Perda', status: 'Download' },
        { id: 2, title: 'Peraturan Bupati Sumedang No. 15 Tahun 2023', category: 'Perbup', status: 'Dipinjam' },
        { id: 3, title: 'Keputusan DPRD Kabupaten Sumedang No. 7 Tahun 2024', category: 'SK', status: 'Download' },
        { id: 4, title: 'Instruksi Bupati Sumedang No. 3 Tahun 2023', category: 'Instruksi', status: 'Dikembalikan' },
        { id: 5, title: 'Peraturan Daerah Kabupaten Sumedang No. 5 Tahun 2023', category: 'Perda', status: 'Dipinjam' },
    ];

    return (
        <AuthGuard>
            <Navbar />
            <div className="dashboard-layout">
                <div className="dashboard-content">
                    {/* Page Header */}
                    <div className="page-header animate-in">
                        <h1>
                            Selamat datang, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p>Pinjam & download buku hukum dari Perpustakaan JDIH Sumedang</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className={`stat-card animate-in-delay-${index < 4 ? index : 3}`}
                                >
                                    <div className={`stat-icon ${stat.color}`}>
                                        <Icon size={22} />
                                    </div>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 16,
                        }}>
                            Akses Cepat
                        </h2>
                        <div className="quick-actions">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        href={action.href}
                                        className="quick-action-card"
                                    >
                                        <div
                                            className="icon"
                                            style={{ background: action.color, color: action.iconColor }}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <h3>{action.title}</h3>
                                        <p>{action.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Books Table */}
                    <div style={{ marginBottom: 32 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 16,
                        }}>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}>
                                Aktivitas Terbaru
                            </h2>
                            <Link
                                href="/books"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    fontSize: '0.875rem',
                                    color: 'var(--primary)',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                }}
                            >
                                Lihat Semua <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Judul Buku/Dokumen</th>
                                        <th>Jenis</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBooks.map((book, index) => (
                                        <tr key={book.id}>
                                            <td>{index + 1}</td>
                                            <td style={{ maxWidth: 400 }}>{book.title}</td>
                                            <td>
                                                <span className="badge badge-user">{book.category}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${book.status === 'Dipinjam' ? 'badge-admin' : book.status === 'Download' ? 'badge-success' : 'badge-user'}`}>
                                                    {book.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
