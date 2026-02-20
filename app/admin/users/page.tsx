'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { usersAPI } from '@/lib/api';
import { Users, Plus, Trash2, Edit, Shield, User as UserIcon, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'pengguna' });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await usersAPI.getAll();
            setUsers(res.data.data);
        } catch {
            setMessage({ type: 'error', text: 'Gagal memuat data pengguna' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const openAddModal = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', password: '', role: 'pengguna' });
        setModalOpen(true);
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const updateData: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
                if (form.password) updateData.password = form.password;
                await usersAPI.update(editingUser.id, updateData);
                setMessage({ type: 'success', text: 'Pengguna berhasil diperbarui' });
            } else {
                await usersAPI.create(form);
                setMessage({ type: 'success', text: 'Pengguna berhasil ditambahkan' });
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menyimpan pengguna' });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Hapus pengguna "${name}"?`)) return;
        try {
            await usersAPI.delete(id);
            setMessage({ type: 'success', text: 'Pengguna berhasil dihapus' });
            fetchUsers();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menghapus pengguna' });
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem',
        marginBottom: '0.5rem', fontWeight: 500,
    };

    return (
        <AuthGuard requireAdmin>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Users size={28} /> Kelola Pengguna
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                                {users.length} pengguna terdaftar
                            </p>
                        </div>
                        <button onClick={openAddModal} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '0.7rem 1.2rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem',
                        }}>
                            <Plus size={18} /> Tambah Pengguna
                        </button>
                    </div>

                    {/* Message */}
                    {message && (
                        <div style={{
                            padding: '1rem 1.25rem', borderRadius: 12, marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                            <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text" placeholder="Cari pengguna..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: 42 }}
                        />
                    </div>

                    {/* Users Table */}
                    <div style={{
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', borderRadius: 16, overflow: 'hidden',
                    }}>
                        {loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada pengguna ditemukan</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            {['Nama', 'Email', 'Role', 'Terdaftar', 'Aksi'].map(h => (
                                                <th key={h} style={{
                                                    padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem',
                                                    fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 36, height: 36, borderRadius: '50%',
                                                            background: user.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: user.role === 'admin' ? '#ef4444' : '#3b82f6',
                                                        }}>
                                                            {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                                                        </div>
                                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                                                        background: user.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                                                        color: user.role === 'admin' ? '#ef4444' : '#3b82f6',
                                                    }}>{user.role === 'admin' ? 'Admin' : 'Pengguna'}</span>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => openEditModal(user)} style={{
                                                            width: 34, height: 34, borderRadius: 8, border: 'none',
                                                            background: 'rgba(59,130,246,0.1)', color: '#3b82f6', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}><Edit size={15} /></button>
                                                        <button onClick={() => handleDelete(user.id, user.name)} style={{
                                                            width: 34, height: 34, borderRadius: 8, border: 'none',
                                                            background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}><Trash2 size={15} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* Add/Edit Modal */}
                {modalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '1rem',
                    }} onClick={() => setModalOpen(false)}>
                        <div onClick={e => e.stopPropagation()} style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                            borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440,
                            animation: 'fadeSlideDown 0.2s ease',
                        }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Nama *</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Nama lengkap" />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} placeholder="email@contoh.com" />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>{editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
                                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editingUser} style={inputStyle} placeholder="Min. 6 karakter" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>Role</label>
                                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, appearance: 'none' as const }}>
                                        <option value="pengguna" style={{ background: 'var(--bg-secondary)' }}>Pengguna</option>
                                        <option value="admin" style={{ background: 'var(--bg-secondary)' }}>Admin</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="button" onClick={() => setModalOpen(false)} style={{
                                        flex: 1, padding: '0.75rem', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem',
                                    }}>Batal</button>
                                    <button type="submit" style={{
                                        flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                    }}>{editingUser ? 'Simpan' : 'Tambah'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    @keyframes fadeSlideDown {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    input:focus, select:focus {
                        border-color: var(--primary) !important;
                        box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
                    }
                `}</style>
            </div>
        </AuthGuard>
    );
}
