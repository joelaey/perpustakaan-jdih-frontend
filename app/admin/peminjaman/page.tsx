'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { borrowingsAPI, messagesAPI } from '@/lib/api';
import { BookOpen, Clock, CheckCircle, XCircle, RotateCcw, AlertCircle, ChevronDown, Eye, X, Send } from 'lucide-react';

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
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Menunggu', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    approved: { label: 'Disetujui', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    borrowed: { label: 'Dipinjam', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    returned: { label: 'Dikembalikan', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    rejected: { label: 'Ditolak', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function AdminBorrowingsPage() {
    const router = useRouter();
    const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, borrowed: 0, returned: 0, rejected: 0, total: 0 });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [sendingChat, setSendingChat] = useState(false);

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
            if (selectedBorrowing && selectedBorrowing.id === id) {
                setSelectedBorrowing({ ...selectedBorrowing, status });
            }
            fetchData();
        } catch {
            setMessage({ type: 'error', text: 'Gagal mengubah status' });
        }
    };

    const openDetail = (b: Borrowing) => {
        setSelectedBorrowing(b);
        setChatMessage(`Halo ${b.user_name}, terkait pengajuan peminjaman buku "${b.book_title}"...\n`);
    };

    const handleSendChat = async () => {
        if (!selectedBorrowing || !chatMessage.trim()) return;
        setSendingChat(true);
        try {
            await messagesAPI.send(selectedBorrowing.user_id, chatMessage);
            setMessage({ type: 'success', text: 'Pesan berhasil dikirim ke pengguna.' });
            setChatMessage('');
        } catch {
            setMessage({ type: 'error', text: 'Gagal mengirim pesan.' });
        } finally {
            setSendingChat(false);
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
                                                        <button onClick={() => openDetail(b)} style={{
                                                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                                            borderRadius: 8, border: 'none', background: 'rgba(59,130,246,0.1)',
                                                            color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
                                                        }}>
                                                            <Eye size={16} /> Detail
                                                        </button>
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

                {/* Detail Modal */}
                {selectedBorrowing && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem',
                    }} onClick={() => setSelectedBorrowing(null)}>
                        <div onClick={e => e.stopPropagation()} style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                            borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 500,
                            animation: 'fadeSlideDown 0.2s ease', position: 'relative',
                            maxHeight: '90vh', overflowY: 'auto'
                        }}>
                            <button onClick={() => setSelectedBorrowing(null)} style={{
                                position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                            }}><X size={20} /></button>

                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                                Detail Peminjaman
                            </h2>

                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 16 }}>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Peminjam</span>
                                    <strong style={{ color: 'var(--text-primary)' }}>{selectedBorrowing.user_name}</strong> ({selectedBorrowing.user_email})
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Buku</span>
                                    <strong style={{ color: 'var(--text-primary)' }}>{selectedBorrowing.book_title}</strong>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Oleh: {selectedBorrowing.book_author || '-'}</div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Status & Tanggal</span>
                                    <span style={{
                                        display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                                        background: statusConfig[selectedBorrowing.status]?.bg, color: statusConfig[selectedBorrowing.status]?.color,
                                        marginBottom: 4
                                    }}>
                                        {statusConfig[selectedBorrowing.status]?.label}
                                    </span>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Diajukan: {formatDate(selectedBorrowing.request_date)}</div>
                                </div>
                                {selectedBorrowing.notes && (
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Catatan / Keperluan</span>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>"{selectedBorrowing.notes}"</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Aksi Status</span>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {selectedBorrowing.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleAction(selectedBorrowing.id, 'approved')} className="btn-primary" style={{ flex: 1, padding: '10px', borderRadius: 8, minWidth: 100 }}>
                                                Setujui
                                            </button>
                                            <button onClick={() => handleAction(selectedBorrowing.id, 'rejected')} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', fontWeight: 600, cursor: 'pointer', minWidth: 100 }}>
                                                Tolak
                                            </button>
                                        </>
                                    )}
                                    {selectedBorrowing.status === 'approved' && (
                                        <button onClick={() => handleAction(selectedBorrowing.id, 'borrowed')} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            Tandai Dipinjam (Buku Diambil)
                                        </button>
                                    )}
                                    {selectedBorrowing.status === 'borrowed' && (
                                        <button onClick={() => handleAction(selectedBorrowing.id, 'returned')} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                            Tandai Dikembalikan
                                        </button>
                                    )}
                                    {['returned', 'rejected'].includes(selectedBorrowing.status) && (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada aksi status tersedia.</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Chat dengan Pengguna</span>
                                <textarea
                                    value={chatMessage}
                                    onChange={e => setChatMessage(e.target.value)}
                                    rows={3}
                                    placeholder="Tulis pesan..."
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--glass-border)',
                                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
                                        fontFamily: 'inherit', resize: 'vertical', marginBottom: 12
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={handleSendChat} disabled={!chatMessage.trim() || sendingChat} className="btn-primary" style={{
                                        padding: '10px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center',
                                        opacity: (!chatMessage.trim() || sendingChat) ? 0.6 : 1, cursor: (!chatMessage.trim() || sendingChat) ? 'not-allowed' : 'pointer', border: 'none'
                                    }}>
                                        <Send size={16} /> {sendingChat ? 'Mengirim...' : 'Kirim Pesan'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
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
