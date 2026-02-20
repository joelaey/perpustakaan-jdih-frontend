'use client';

import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import { User as UserIcon, Mail, Shield, Save, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await usersAPI.updateProfile(profileForm);
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui. Silakan login ulang untuk melihat perubahan.' });
        } catch {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Password baru tidak cocok' });
            setLoading(false);
            return;
        }
        try {
            await usersAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setMessage({ type: 'success', text: 'Password berhasil diubah' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengubah password' });
        } finally {
            setLoading(false);
        }
    };

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
        <AuthGuard>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    {/* Profile Card */}
                    <div style={{
                        textAlign: 'center', marginBottom: '2rem',
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <UserIcon size={36} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{user?.email}</p>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                            padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                            background: user?.role === 'admin' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                            color: user?.role === 'admin' ? '#ef4444' : '#3b82f6',
                        }}>
                            <Shield size={13} /> {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                        </span>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                        {[
                            { key: 'profile' as const, label: 'Edit Profil', icon: UserIcon },
                            { key: 'password' as const, label: 'Ubah Password', icon: Lock },
                        ].map(tab => (
                            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMessage(null); }} style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '0.75rem', borderRadius: 12, border: 'none', cursor: 'pointer',
                                fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                                background: activeTab === tab.key ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                            }}>
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
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
                        </div>
                    )}

                    {/* Profile Form */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem',
                        }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}><UserIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Nama</label>
                                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required style={inputStyle} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}><Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />Email</label>
                                <input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required style={inputStyle} />
                            </div>
                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1,
                            }}>
                                <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </form>
                    )}

                    {/* Password Form */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} style={{
                            background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem',
                        }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Password Saat Ini</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showCurrent ? 'text' : 'password'} value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required style={{ ...inputStyle, paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                    }}>{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={labelStyle}>Password Baru</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showNew ? 'text' : 'password'} value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required minLength={6} style={{ ...inputStyle, paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowNew(!showNew)} style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                    }}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Konfirmasi Password Baru</label>
                                <input type="password" value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required minLength={6} style={inputStyle} />
                            </div>
                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1,
                            }}>
                                <Lock size={18} /> {loading ? 'Mengubah...' : 'Ubah Password'}
                            </button>
                        </form>
                    )}
                </main>
            </div>
            <style jsx>{`
                input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
            `}</style>
        </AuthGuard>
    );
}
