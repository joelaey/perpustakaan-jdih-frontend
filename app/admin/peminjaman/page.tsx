'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI } from '@/lib/api';
import { BookOpen, Clock, CheckCircle, XCircle, RotateCcw, AlertCircle, ChevronDown } from 'lucide-react';

interface Borrowing {
    id: number;
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
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Menunggu', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    approved: { label: 'Disetujui', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    borrowed: { label: 'Dipinjam', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    returned: { label: 'Dikembalikan', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Ditolak', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function AdminBorrowingsPage() {
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, borrowed: 0, returned: 0, rejected: 0, total: 0 });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [actionId, setActionId] = useState<number | null>(null);

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

    const handleAction = async (id: number, status: string) => {
        try {
            await borrowingsAPI.updateStatus(id, status);
            setMessage({ type: 'success', text: `Status berhasil diubah ke "${statusConfig[status]?.label}"` });
            setActionId(null);
            fetchData();
        } catch {
            setMessage({ type: 'error', text: 'Gagal mengubah status' });
        }
    };

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
                                            {['Peminjam', 'Buku', 'Status', 'Tanggal', 'Jatuh Tempo', 'Aksi'].map(h => (
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
                                                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.user_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.user_email}</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', maxWidth: 250 }}>
                                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book_title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.book_author || '—'}</div>
                                                    </td>
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                                    </td>
                                                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatDate(b.request_date)}</td>
                                                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: b.due_date && new Date(b.due_date) < new Date() && b.status === 'borrowed' ? '#ef4444' : 'var(--text-secondary)' }}>
                                                        {formatDate(b.due_date)}
                                                    </td>
                                                    <td style={{ padding: '14px 16px', position: 'relative' }}>
                                                        <button onClick={() => setActionId(actionId === b.id ? null : b.id)} style={{
                                                            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                                                            borderRadius: 8, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)',
                                                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
                                                        }}>
                                                            Aksi <ChevronDown size={14} />
                                                        </button>
                                                        {actionId === b.id && (
                                                            <div style={{
                                                                position: 'absolute', top: '100%', right: 16, zIndex: 100,
                                                                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                                                                borderRadius: 12, padding: 6, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                                            }}>
                                                                {b.status === 'pending' && (
                                                                    <>
                                                                        <button onClick={() => handleAction(b.id, 'approved')} style={actionBtnStyle('#3b82f6')}>
                                                                            <CheckCircle size={14} /> Setujui
                                                                        </button>
                                                                        <button onClick={() => handleAction(b.id, 'rejected')} style={actionBtnStyle('#ef4444')}>
                                                                            <XCircle size={14} /> Tolak
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {b.status === 'approved' && (
                                                                    <button onClick={() => handleAction(b.id, 'borrowed')} style={actionBtnStyle('#8b5cf6')}>
                                                                        <BookOpen size={14} /> Tandai Dipinjam
                                                                    </button>
                                                                )}
                                                                {b.status === 'borrowed' && (
                                                                    <button onClick={() => handleAction(b.id, 'returned')} style={actionBtnStyle('#22c55e')}>
                                                                        <RotateCcw size={14} /> Tandai Dikembalikan
                                                                    </button>
                                                                )}
                                                                {['returned', 'rejected'].includes(b.status) && (
                                                                    <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tidak ada aksi</div>
                                                                )}
                                                            </div>
                                                        )}
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

const actionBtnStyle = (color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
    padding: '8px 12px', borderRadius: 8, border: 'none',
    background: 'transparent', color, cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 500, textAlign: 'left',
});
