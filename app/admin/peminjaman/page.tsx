'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { borrowingsAPI } from '@/lib/api';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface Borrowing {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    book_title: string;
    book_author: string;
    status: string;
    request_date: string;
    approved_date: string | null;
    due_date: string | null;
    return_date: string | null;
    notes: string | null;
    admin_notes: string | null;
    pickup_proof: string | null;
    return_proof: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Menunggu', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    approved: { label: 'Disetujui', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    borrowed: { label: 'Dipinjam', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    returned: { label: 'Dikembalikan', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Ditolak', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function AdminBorrowingsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, borrowed: 0, returned: 0, rejected: 0, total: 0 });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [borRows, statsRes] = await Promise.all([
                borrowingsAPI.getAll({ status: filter || undefined }),
                borrowingsAPI.getStats(),
            ]);
            setBorrowings(borRows.data.data || []);
            setStats(statsRes.data.data || stats);
        } catch {
            setMessage({ type: 'error', text: 'Gagal memuat data' });
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <AuthGuard requireAdmin>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookOpen size={28} /> Kelola Peminjaman
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{stats.total} peminjaman total</p>


                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '2rem' }}>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                            <button key={key} onClick={() => setFilter(filter === key ? '' : key)} style={{
                                padding: '1rem', borderRadius: 14, border: filter === key ? `2px solid ${cfg.color}` : '1px solid var(--glass-border)',
                                background: filter === key ? cfg.bg : 'var(--glass-bg)', cursor: 'pointer', textAlign: 'left',
                                transition: 'all 0.2s',
                            }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-sans)' }}>
                                    {stats[key as keyof typeof stats] || 0}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{cfg.label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Message */}
                    {message && (
                        <div style={{
                            padding: '1rem', borderRadius: 12, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8,
                            background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {/* Table */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat...</div>
                        ) : borrowings.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada peminjaman</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            {['Peminjam', 'Buku', 'Waktu Aktif', 'Status', 'Foto Bukti'].map(h => (
                                                <th key={h} style={{
                                                    padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem',
                                                    fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {borrowings.map(b => {
                                            const cfg = statusConfig[b.status] || statusConfig.pending;
                                            return (
                                                <tr key={b.id} onClick={() => router.push(`/admin/peminjaman/${b.id}`)} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s', background: 'var(--bg-primary)' }}
                                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'var(--bg-primary)'}>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.user_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.user_email}</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', maxWidth: 250 }}>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book_title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.book_author || '—'}</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', minWidth: 140 }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>{
                                                            b.status === 'pending' ? 'Diajukan Pada:' :
                                                                b.status === 'approved' ? 'Disetujui Pada:' :
                                                                    b.status === 'borrowed' ? 'Tenggat Kembali:' :
                                                                        b.status === 'returned' ? 'Dikembalikan:' : 'Diajukan Pada:'
                                                        }</div>
                                                        <div style={{ fontSize: '0.85rem', color: b.status === 'borrowed' ? '#f59e0b' : 'var(--text-primary)', fontWeight: 600 }}>{
                                                            b.status === 'pending' && b.request_date ? formatDate(b.request_date) :
                                                                b.status === 'approved' && b.approved_date ? formatDate(b.approved_date) :
                                                                    b.status === 'borrowed' && b.due_date ? formatDate(b.due_date) :
                                                                        b.status === 'returned' && b.return_date ? formatDate(b.return_date) :
                                                                            b.request_date ? formatDate(b.request_date) : '-'
                                                        }</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {b.pickup_proof ? <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden' }}><img src={b.pickup_proof} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : <div style={{ width: 32, height: 32, borderRadius: 6, border: '1px dashed var(--glass-border)' }}></div>}
                                                            {b.return_proof ? <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden' }}><img src={b.return_proof} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : <div style={{ width: 32, height: 32, borderRadius: 6, border: '1px dashed var(--glass-border)' }}></div>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
