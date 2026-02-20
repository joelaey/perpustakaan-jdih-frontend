'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { BookOpen, BookMarked, Download, Clock, Search } from 'lucide-react';

export default function UserDashboard() {
    const { user } = useAuth();

    const stats = [
        { label: 'Koleksi Buku', value: '2,458', icon: BookOpen, color: 'red' },
        { label: 'Sedang Dipinjam', value: '3', icon: BookMarked, color: 'blue' },
        { label: 'Total Download', value: '24', icon: Download, color: 'purple' },
        { label: 'Riwayat Pinjam', value: '12', icon: Clock, color: 'green' },
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
            description: 'Lihat buku yang sedang dipinjam',
            icon: BookMarked,
            color: 'rgba(59, 130, 246, 0.08)',
            iconColor: '#3b82f6',
            href: '/books',
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
            </div>
        </AuthGuard>
    );
}
