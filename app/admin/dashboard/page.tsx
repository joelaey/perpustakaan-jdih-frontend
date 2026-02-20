'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { booksAPI } from '@/lib/api';
import { BookOpen, Users, FileText, Plus, Library, BookMarked, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [bookCount, setBookCount] = useState(0);

    useEffect(() => {
        booksAPI.getStats()
            .then(res => setBookCount(res.data.total || 0))
            .catch(() => { });
    }, []);

    const stats = [
        { label: 'Total Buku Hukum', value: bookCount.toLocaleString(), icon: BookOpen, color: 'red' },
        { label: 'Pengguna Terdaftar', value: '156', icon: Users, color: 'blue' },
        { label: 'Total Dokumen', value: '324', icon: FileText, color: 'purple' },
        { label: 'Download Bulan Ini', value: '89', icon: BarChart3, color: 'green' },
    ];

    const quickActions = [
        {
            title: 'Kelola Buku',
            description: 'Lihat, edit, dan hapus koleksi buku',
            icon: Library,
            color: 'var(--accent-bg)',
            iconColor: 'var(--accent)',
            href: '/admin/books',
        },
        {
            title: 'Tambah Buku',
            description: 'Tambahkan buku baru ke koleksi',
            icon: Plus,
            color: 'var(--accent-bg)',
            iconColor: 'var(--accent)',
            href: '/admin/tambah-buku',
        },
        {
            title: 'Lihat Katalog',
            description: 'Jelajahi katalog buku publik',
            icon: BookMarked,
            color: 'rgba(59, 130, 246, 0.08)',
            iconColor: '#3b82f6',
            href: '/books',
        },
    ];

    return (
        <AuthGuard requireAdmin>
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <div className="page-header animate-in">
                        <h1>Dashboard Admin</h1>
                        <p>Selamat datang, {user?.name || 'Admin'}</p>
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
