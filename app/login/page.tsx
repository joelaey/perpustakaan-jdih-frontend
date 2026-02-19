'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login, isAuthenticated, isAdmin } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
        }
    }, [isAuthenticated, isAdmin, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                {/* Header */}
                <div className="auth-header">
                    <div className="logo">
                        <Image src="/logo-app.png" alt="JDIH" width={48} height={48} />
                    </div>
                    <h1>Selamat Datang</h1>
                    <p>Masuk ke Perpustakaan JDIH Sumedang</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                style={{ paddingRight: 48 }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: 4,
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                                Memproses...
                            </>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    Belum punya akun?{' '}
                    <Link href="/register">Daftar sekarang</Link>
                </div>

                {/* Admin Info */}
                <div
                    style={{
                        marginTop: 20,
                        padding: '12px 16px',
                        background: 'rgba(249, 115, 22, 0.06)',
                        border: '1px solid rgba(249, 115, 22, 0.15)',
                        borderRadius: 12,
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--primary)' }}>
                        🔑 Informasi Login Admin
                    </div>
                    <div>Email: <strong>admin@jdih-sumedang.go.id</strong></div>
                    <div>Password: <strong>admin123</strong></div>
                </div>
            </div>
        </div>
    );
}
