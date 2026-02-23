'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Timer, Mail, Phone, CheckCircle, BookOpen, Scale } from 'lucide-react';

export default function RegisterPage() {
    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // OTP verification step
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [verifyMethod, setVerifyMethod] = useState<'email' | 'phone'>('email');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { register } = useAuth();
    const router = useRouter();

    // Handle form submit → go to OTP step
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('Nama lengkap harus diisi'); return; }
        if (!email.trim()) { setError('Email harus diisi'); return; }
        if (!phone.trim() || phone.length < 10) { setError('Nomor telepon harus valid (min. 10 digit)'); return; }

        // Password validation
        if (password.length < 8) { setError('Password minimal 8 karakter'); return; }
        if (!/[A-Z]/.test(password)) { setError('Password harus mengandung huruf besar'); return; }
        if (!/[a-z]/.test(password)) { setError('Password harus mengandung huruf kecil'); return; }
        if (!/[0-9]/.test(password)) { setError('Password harus mengandung angka'); return; }

        if (password !== confirmPassword) { setError('Konfirmasi password tidak sama'); return; }

        // Move to verification step
        setStep('verify');
        setError('');
    };

    // Send OTP
    const handleSendOtp = () => {
        setOtpSent(true);
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setOtpTimer((t) => {
                if (t <= 1) { clearInterval(timerRef.current!); return 0; }
                return t - 1;
            });
        }, 1000);
        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Final registration submit with OTP
    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp.join('').length < 6) { setError('Masukkan 6 digit kode OTP'); return; }

        setLoading(true);
        try {
            await register(name, email, password, phone);
            router.push('/pengguna');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                {/* Illustration Side */}
                <div className="auth-illustration">
                    <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <div className="floating-icon" style={{ position: 'absolute', top: 20, left: 30 }}>
                            <BookOpen size={72} strokeWidth={1.2} />
                        </div>
                        <div className="floating-icon-delay" style={{ position: 'absolute', bottom: 20, right: 30 }}>
                            <Scale size={84} strokeWidth={1.2} />
                        </div>
                        <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'var(--accent)', opacity: 0.1, filter: 'blur(24px)', position: 'absolute' }} />
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, marginBottom: 12, textAlign: 'center', color: 'var(--text-primary)' }}>
                        JDIH <span style={{ color: 'var(--accent)' }}>Sumedang</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.95rem', maxWidth: 300, lineHeight: 1.6 }}>
                        Bergabunglah untuk mengakses, meminjam, dan membaca koleksi perpustakaan hukum terlengkap.
                    </p>
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    <div className="auth-header">
                        <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image src="/logo-awal-jdihn-small.png" alt="JDIH" width={56} height={56} />
                        </div>
                        <h1>{step === 'form' ? 'Daftar' : 'Verifikasi'}</h1>
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

                    {/* ─── STEP 1: Registration Form ─── */}
                    {step === 'form' && (
                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Nama lengkap Anda"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

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
                                <label>Nomor Telepon</label>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{
                                        padding: '10px 12px', border: '1px solid var(--border)',
                                        background: 'var(--surface)', fontSize: '0.9375rem',
                                        fontWeight: 600, color: 'var(--text-secondary)', borderRadius: 2,
                                    }}>+62</span>
                                    <input
                                        type="tel"
                                        placeholder="81234567890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 8 karakter, huruf & angka"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Konfirmasi Password</label>
                                <input
                                    type="password"
                                    placeholder="Ulangi password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1.5rem', color: '#fff', opacity: 1 }}
                            >
                                Lanjutkan
                            </button>

                            <div className="auth-footer">
                                Sudah punya akun? <Link href="/login">Masuk</Link>
                            </div>
                        </form>
                    )}

                    {/* ─── STEP 2: OTP Verification ─── */}
                    {step === 'verify' && (
                        <div>
                            {/* Back button */}
                            <button
                                onClick={() => { setStep('form'); setOtpSent(false); setOtp(['', '', '', '', '', '']); setError(''); }}
                                className="btn btn-ghost"
                                style={{ padding: '4px 0', marginBottom: 16, fontSize: '0.8125rem' }}
                            >
                                <ArrowLeft size={14} /> Kembali ke form
                            </button>

                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 24 }}>
                                Pilih metode verifikasi untuk mengonfirmasi akun Anda.
                            </p>

                            {/* Choose verification method */}
                            <div className="auth-toggle" style={{ marginBottom: 24 }}>
                                <button
                                    className={verifyMethod === 'email' ? 'active' : ''}
                                    onClick={() => { setVerifyMethod('email'); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                                >
                                    <Mail size={14} /> Email
                                </button>
                                <button
                                    className={verifyMethod === 'phone' ? 'active' : ''}
                                    onClick={() => { setVerifyMethod('phone'); setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                                >
                                    <Phone size={14} /> SMS
                                </button>
                            </div>

                            {/* Destination info */}
                            <div style={{
                                padding: '12px 16px', background: 'var(--accent-bg)', border: '1px solid rgba(196,30,58,0.1)',
                                borderRadius: 2, marginBottom: 20, fontSize: '0.875rem',
                            }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 4 }}>
                                    Kirim kode ke
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {verifyMethod === 'email' ? email : `+62${phone}`}
                                </div>
                            </div>

                            {!otpSent ? (
                                <button
                                    onClick={handleSendOtp}
                                    className="btn btn-primary"
                                    style={{ width: '100%', color: '#fff' }}
                                >
                                    <CheckCircle size={16} /> Kirim Kode OTP
                                </button>
                            ) : (
                                <form onSubmit={handleVerifySubmit}>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Masukkan Kode OTP
                                    </label>
                                    <div className="otp-container">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            />
                                        ))}
                                    </div>

                                    {/* Timer / Resend */}
                                    <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 12, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                        <Timer size={12} />
                                        {otpTimer > 0 ? `${otpTimer} detik` : (
                                            <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>
                                                Kirim ulang
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary"
                                        style={{ width: '100%', opacity: loading ? 0.6 : 1, color: '#fff' }}
                                    >
                                        {loading ? 'Memuat...' : 'Verifikasi & Daftar'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
