'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Eye, EyeOff, AlertCircle, Loader2, CheckCircle2,
    Mail, Phone, ArrowRight, Timer,
} from 'lucide-react';

export default function RegisterPage() {
    const { register, isAuthenticated } = useAuth();
    const router = useRouter();
    const [mode, setMode] = useState<'email' | 'phone'>('email');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP states
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // OTP timer countdown
    React.useEffect(() => {
        if (otpTimer > 0) {
            const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [otpTimer]);

    const passwordRequirements = [
        { label: 'Minimal 6 karakter', met: password.length >= 6 },
        { label: 'Mengandung huruf', met: /[a-zA-Z]/.test(password) },
        { label: 'Mengandung angka', met: /[0-9]/.test(password) },
    ];

    const handleSendOtp = () => {
        if (!phone || phone.length < 10) {
            setError('Masukkan nomor telepon yang valid');
            return;
        }
        setOtpSent(true);
        setOtpTimer(60);
        setError('');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (mode === 'phone' && !otpSent) {
            setError('Silakan verifikasi nomor telepon terlebih dahulu');
            return;
        }

        setLoading(true);

        try {
            const identifier = mode === 'email' ? email : `+62${phone}`;
            await register(name, identifier, password);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
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
                    <h1>Buat Akun</h1>
                    <p>Daftar sebagai pengguna Perpustakaan JDIH</p>
                </div>

                {/* Email / Phone Toggle */}
                <div className="auth-toggle">
                    <button
                        type="button"
                        className={mode === 'email' ? 'active' : ''}
                        onClick={() => { setMode('email'); setError(''); setOtpSent(false); }}
                    >
                        <Mail size={16} /> Email
                    </button>
                    <button
                        type="button"
                        className={mode === 'phone' ? 'active' : ''}
                        onClick={() => { setMode('phone'); setError(''); setOtpSent(false); }}
                    >
                        <Phone size={16} /> No. Telepon
                    </button>
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
                        <label className="form-label" htmlFor="name">Nama Lengkap</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Masukkan nama lengkap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    {mode === 'email' ? (
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                className="form-input"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-phone">Nomor Telepon</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{
                                    padding: '12px 14px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    borderRadius: 12,
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                }}>
                                    +62
                                </div>
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    className="form-input"
                                    placeholder="812xxxxxxxx"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    required
                                    style={{ flex: 1 }}
                                />
                            </div>

                            {/* Send OTP Button */}
                            {!otpSent ? (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="btn btn-ghost"
                                    style={{
                                        width: '100%',
                                        marginTop: 10,
                                        borderColor: 'var(--primary)',
                                        color: 'var(--primary)',
                                    }}
                                >
                                    <ArrowRight size={16} /> Kirim Kode OTP
                                </button>
                            ) : (
                                <>
                                    {/* OTP Input */}
                                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: 12,
                                        }}>
                                            Masukkan 6 digit kode OTP
                                        </div>
                                        <div className="otp-container">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    className="otp-input"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    maxLength={1}
                                                />
                                            ))}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            marginTop: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 6,
                                        }}>
                                            <Timer size={14} />
                                            {otpTimer > 0 ? (
                                                `Kirim ulang dalam ${otpTimer}s`
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--primary)',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    Kirim Ulang OTP
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="reg-password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Buat password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
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

                        {/* Password Requirements */}
                        {password.length > 0 && (
                            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {passwordRequirements.map((req) => (
                                    <div
                                        key={req.label}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: '0.75rem',
                                            color: req.met ? 'var(--success)' : 'var(--text-muted)',
                                        }}
                                    >
                                        <CheckCircle2 size={14} />
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirm-password">Konfirmasi Password</label>
                        <input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="Ulangi password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        {confirmPassword.length > 0 && password !== confirmPassword && (
                            <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--danger)' }}>
                                Password tidak cocok
                            </div>
                        )}
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
                                Mendaftar...
                            </>
                        ) : (
                            'Daftar Sekarang'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    Sudah punya akun?{' '}
                    <Link href="/login">Masuk di sini</Link>
                </div>
            </div>
        </div>
    );
}
