'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI, booksAPI } from '@/lib/api';
import { BookOpen, BookMarked, MessageCircle, Clock, Search, Book } from 'lucide-react';

export default function UserDashboard() {
    const { user } = useAuth();
    const [borrowings, setBorrowings] = useState<any[]>([]);
    const [bookCount, setBookCount] = useState(0);

    useEffect(() => {
        borrowingsAPI.getAll()
            .then(res => setBorrowings(res.data.data || []))
            .catch(console.error)

        booksAPI.getStats()
            .then(res => setBookCount(res.data.data?.total_books || 0))
            .catch(console.error)
    }, []);

    const currentlyBorrowed = borrowings.filter(b => b.status === 'borrowed').length;

    const stats = [
        { label: 'Koleksi Tersedia', value: bookCount.toString(), icon: BookOpen, color: 'red' },
        { label: 'Sedang Dipinjam', value: currentlyBorrowed.toString(), icon: BookMarked, color: 'blue' },
        { label: 'Riwayat Pinjam', value: borrowings.length.toString(), icon: Clock, color: 'green' },
    ];

    const quickActions = [
        {
            title: 'Lihat Katalog Buku',
            description: 'Cari & lihat koleksi buku',
            icon: Book,
            color: 'var(--accent-bg)',
            iconColor: 'var(--accent)',
            href: '/books',
        },
        {
            title: 'Peminjaman',
            description: 'Status & riwayat peminjaman',
            icon: BookMarked,
            color: 'rgba(59, 130, 246, 0.08)',
            iconColor: '#3b82f6',
            href: '/pengguna/peminjaman',
        },
        {
            title: 'Chat Admin',
            description: 'Hubungi admin perpustakaan',
            icon: MessageCircle,
            color: 'rgba(34, 197, 94, 0.08)',
            iconColor: '#22c55e',
            href: '/pengguna/chat',
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
