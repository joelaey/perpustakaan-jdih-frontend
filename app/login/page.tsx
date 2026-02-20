'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { setError('Email dan password harus diisi'); return; }
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login gagal';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                <div className="auth-header">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image src="/logo-awal-jdihn-small.png" alt="JDIH" width={56} height={56} />
                    </div>
                    <h1>Masuk</h1>
                    <p>Perpustakaan JDIH Kab. Sumedang</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px', marginBottom: 20,
                        background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
                        borderRadius: 2, fontSize: '0.8125rem', color: 'var(--danger)',
                    }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 8, opacity: loading ? 0.6 : 1 }}
                    >
                        {loading ? 'Memuat...' : 'Masuk'}
                    </button>
                </form>

                <div className="auth-footer">
                    Belum punya akun? <Link href="/register">Daftar</Link>
                </div>

                <div className="info-box">
                    <div className="info-title">🔑 Akun Admin Demo</div>
                    <div>Email: <strong>admin@jdih-sumedang.go.id</strong></div>
                    <div>Password: <strong>admin123</strong></div>
                </div>
            </div>
        </div>
    );
}
