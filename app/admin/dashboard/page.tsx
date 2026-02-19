'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import {
    BookOpen,
    Users,
    FileText,
    Download,
    ArrowRight,
    Plus,
    Settings,
    BarChart3,
    ShieldCheck,
    UserPlus,
    BookMarked,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Total Buku Hukum', value: '2,458', icon: BookOpen, color: 'orange', change: '+12 bulan ini' },
        { label: 'Total Peminjam', value: '156', icon: Users, color: 'blue', change: '+8 bulan ini' },
        { label: 'Sedang Dipinjam', value: '34', icon: BookMarked, color: 'purple', change: '5 jatuh tempo' },
        { label: 'Total Download', value: '1,247', icon: Download, color: 'green', change: '+22% dari bulan lalu' },
    ];

    const quickActions = [
        {
            title: 'Tambah Buku Hukum',
            description: 'Upload buku/dokumen hukum baru',
            icon: Plus,
            color: 'rgba(249, 115, 22, 0.15)',
            iconColor: 'var(--primary)',
            href: '/admin/tambah-buku',
        },
        {
            title: 'Kelola Buku',
            description: 'Manajemen koleksi buku perpustakaan',
            icon: BookOpen,
            color: 'rgba(234, 88, 12, 0.15)',
            iconColor: 'var(--secondary)',
            href: '/admin/books',
        },
        {
            title: 'Kelola Pengguna',
            description: 'Manajemen pengguna & peminjaman',
            icon: UserPlus,
            color: 'rgba(251, 146, 60, 0.15)',
            iconColor: 'var(--accent)',
            href: '/admin/dashboard',
        },
        {
            title: 'Pengaturan',
            description: 'Konfigurasi sistem',
            icon: Settings,
            color: 'rgba(16, 185, 129, 0.15)',
            iconColor: 'var(--success)',
            href: '/admin/settings',
        },
    ];

    const recentUsers = [
        { id: 1, name: 'Ahmad Kurniawan', email: 'ahmad@email.com', role: 'pengguna', joinDate: '14 Feb 2026' },
        { id: 2, name: 'Siti Nurhaliza', email: 'siti@email.com', role: 'pengguna', joinDate: '12 Feb 2026' },
        { id: 3, name: 'Budi Santoso', email: 'budi@email.com', role: 'pengguna', joinDate: '10 Feb 2026' },
        { id: 4, name: 'Dewi Lestari', email: 'dewi@email.com', role: 'pengguna', joinDate: '8 Feb 2026' },
    ];

    const recentDocuments = [
        { id: 1, title: 'Perda No. 1 Tahun 2024 tentang RPJMD', category: 'Perda', status: 'Tersedia' },
        { id: 2, title: 'Perbup No. 15 Tahun 2023 tentang OPD', category: 'Perbup', status: 'Dipinjam' },
        { id: 3, title: 'SK Bupati No. 22 Tahun 2024', category: 'SK', status: 'Tersedia' },
        { id: 4, title: 'Perda No. 3 Tahun 2023 tentang APBD', category: 'Perda', status: 'Dipinjam' },
    ];

    return (
        <AuthGuard requireAdmin>
            <Navbar />
            <div className="dashboard-layout">
                <div className="dashboard-content">
                    {/* Page Header */}
                    <div className="page-header animate-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
                                Panel Administrator
                            </span>
                        </div>
                        <h1>Dashboard Admin</h1>
                        <p>Kelola buku hukum, peminjaman, & download perpustakaan JDIH</p>
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
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--success)',
                                        marginTop: 8,
                                        fontWeight: 500,
                                    }}>
                                        {stat.change}
                                    </div>
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
                            Aksi Cepat
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

                    {/* Two Column Layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: 24,
                    }}>
                        {/* Recent Documents */}
                        <div>
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
                                    Buku Hukum Terbaru
                                </h2>
                                <Link
                                    href="/admin/books"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: '0.8125rem',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Lihat Semua <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Judul</th>
                                            <th>Kategori</th>
                                            <th>Ketersediaan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentDocuments.map((doc) => (
                                            <tr key={doc.id}>
                                                <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {doc.title}
                                                </td>
                                                <td>
                                                    <span className="badge badge-user">{doc.category}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${doc.status === 'Tersedia' ? 'badge-success' : 'badge-admin'}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div>
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
                                    Pengguna Terbaru
                                </h2>
                                <Link
                                    href="/admin/users"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: '0.8125rem',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Lihat Semua <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Nama</th>
                                            <th>Email</th>
                                            <th>Tgl Daftar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.name}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                                    {u.joinDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
