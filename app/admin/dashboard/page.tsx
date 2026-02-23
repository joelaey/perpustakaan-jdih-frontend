'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { booksAPI, usersAPI, borrowingsAPI } from '@/lib/api';
import { BookOpen, Users, Clock, CheckCircle, Plus, Library, BookMarked, UserCog, ClipboardList, MessageCircle, RotateCcw } from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [bookCount, setBookCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [borrowStats, setBorrowStats] = useState({ pending: 0, borrowed: 0, returned: 0, total: 0 });

    useEffect(() => {
        booksAPI.getStats()
            .then(res => setBookCount(res.data.data?.total_books || 0))
            .catch(() => { });
        usersAPI.getAll()
            .then(res => setUserCount(res.data.data?.length || 0))
            .catch(() => { });
        borrowingsAPI.getStats()
            .then(res => setBorrowStats(res.data.data || borrowStats))
            .catch(() => { });
    }, []);

    const stats = [
        { label: 'Total Buku', value: bookCount.toLocaleString(), icon: BookOpen, color: 'red' },
        { label: 'Pengguna', value: userCount.toLocaleString(), icon: Users, color: 'blue' },
        { label: 'Menunggu Persetujuan', value: String(borrowStats.pending), icon: Clock, color: 'purple' },
        { label: 'Sedang Dipinjam', value: String(borrowStats.borrowed), icon: BookMarked, color: 'green' },
    ];

    const quickActions = [
        { title: 'Kelola Buku', description: 'Lihat, edit, dan hapus koleksi', icon: Library, color: 'var(--accent-bg)', iconColor: 'var(--accent)', href: '/admin/books' },
        { title: 'Peminjaman', description: 'Verifikasi & tracking peminjaman', icon: ClipboardList, color: 'rgba(139,92,246,0.08)', iconColor: '#8b5cf6', href: '/admin/peminjaman' },
        { title: 'Kelola Users', description: 'Tambah & kelola pengguna', icon: UserCog, color: 'rgba(59,130,246,0.08)', iconColor: '#3b82f6', href: '/admin/users' },
        { title: 'Chat', description: 'Balas pesan dari pengguna', icon: MessageCircle, color: 'rgba(34,197,94,0.08)', iconColor: '#22c55e', href: '/admin/chat' },
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

                    {/* Recent Info Bar */}
                    {borrowStats.pending > 0 && (
                        <Link href="/admin/peminjaman" style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.25rem',
                            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                            borderRadius: 14, marginBottom: 24, color: '#f59e0b', textDecoration: 'none',
                            fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s',
                        }}>
                            <Clock size={18} />
                            {borrowStats.pending} permintaan peminjaman menunggu persetujuan
                        </Link>
                    )}

                    {/* Section Divider */}
                    <div style={{ marginBottom: 32 }}>
                        <span className="section-label">Aksi</span>
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
