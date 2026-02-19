'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import {
    BookOpen, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';

const fieldTypeOptions = [
    'Hukum Perdata', 'Hukum Pidana', 'Hukum Pidana Khusus', 'Hukum Tatanegara',
    'Hukum Administrasi Negara', 'Hukum Acara Perdata', 'Hukum Acara Pidana',
    'Hukum Agraria', 'Hukum Ekonomi', 'Hukum Ekonomi Internasional',
    'Hukum Umum', 'Hukum Internasional', 'Hukum Perdata Internasional',
    'HKI', 'HAKI', 'Manajemen', 'Ekonomi', 'Agama & Pembangunan',
    'Psikologi/ Motivasi', 'Kesehatan / Etika Profesi', 'Lainnya',
];

export default function TambahBukuPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [form, setForm] = useState({
        title: '',
        author: '',
        publisher: '',
        publish_place: '',
        year: '',
        isbn: '',
        subject: '',
        field_type: '',
        physical_description: '',
        language: 'Indonesia',
        location: 'Bagian Hukum Kabupaten Sumedang',
        file_url: '',
        cover: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiUrl}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    year: form.year ? parseInt(form.year) : null,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: 'success', text: 'Buku berhasil ditambahkan!' });
                // Reset form
                setForm({
                    title: '', author: '', publisher: '', publish_place: '',
                    year: '', isbn: '', subject: '', field_type: '',
                    physical_description: '', language: 'Indonesia',
                    location: 'Bagian Hukum Kabupaten Sumedang', file_url: '', cover: '',
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menambahkan buku' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menghubungi server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard requireAdmin>
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <Navbar />

                <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="glass-button"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
                                borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-secondary)', fontSize: '0.9rem',
                            }}
                        >
                            <ArrowLeft size={18} /> Kembali
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                <BookOpen size={28} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Tambah Buku Hukum
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                Tambahkan buku hukum baru ke perpustakaan JDIH
                            </p>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '20px',
                        padding: '2rem',
                    }}>
                        {/* Title */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Judul Buku *
                            </label>
                            <input
                                type="text" name="title" value={form.title} onChange={handleChange} required
                                placeholder="Masukkan judul buku hukum"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                        </div>

                        {/* Author & Publisher - 2 columns */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Penulis / Pengarang
                                </label>
                                <input
                                    type="text" name="author" value={form.author} onChange={handleChange}
                                    placeholder="Nama penulis"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Penerbit
                                </label>
                                <input
                                    type="text" name="publisher" value={form.publisher} onChange={handleChange}
                                    placeholder="Nama penerbit"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Place, Year, ISBN - 3 columns */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Tempat Terbit
                                </label>
                                <input
                                    type="text" name="publish_place" value={form.publish_place} onChange={handleChange}
                                    placeholder="Kota"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Tahun Terbit
                                </label>
                                <input
                                    type="number" name="year" value={form.year} onChange={handleChange}
                                    placeholder="2024"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    ISBN / ISSN
                                </label>
                                <input
                                    type="text" name="isbn" value={form.isbn} onChange={handleChange}
                                    placeholder="978-xxx-xxx"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Subject & Field Type */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Subjek
                                </label>
                                <input
                                    type="text" name="subject" value={form.subject} onChange={handleChange}
                                    placeholder="Topik / subjek buku"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Bidang Hukum
                                </label>
                                <select
                                    name="field_type" value={form.field_type} onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                        appearance: 'none',
                                    }}
                                >
                                    <option value="" style={{ background: '#1a1a2e' }}>Pilih bidang hukum</option>
                                    {fieldTypeOptions.map((ft) => (
                                        <option key={ft} value={ft} style={{ background: '#1a1a2e' }}>{ft}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Physical Description */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                Deskripsi Fisik
                            </label>
                            <input
                                type="text" name="physical_description" value={form.physical_description} onChange={handleChange}
                                placeholder="Contoh: CCLXIII, 263 hlmn; 21 cm"
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                        </div>

                        {/* File URL & Cover URL */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    URL File (PDF)
                                </label>
                                <input
                                    type="url" name="file_url" value={form.file_url} onChange={handleChange}
                                    placeholder="https://..."
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    URL Cover
                                </label>
                                <input
                                    type="url" name="cover" value={form.cover} onChange={handleChange}
                                    placeholder="https://..."
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Language & Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Bahasa
                                </label>
                                <input
                                    type="text" name="language" value={form.language} onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Lokasi
                                </label>
                                <input
                                    type="text" name="location" value={form.location} onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !form.title}
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                borderRadius: '14px',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading || !form.title ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Simpan Buku
                                </>
                            )}
                        </button>
                    </form>
                </main>
            </div>

            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
      `}</style>
        </AuthGuard>
    );
}
