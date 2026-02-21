'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import {
    BookOpen, ArrowLeft, Save, Loader2, CheckCircle, AlertCircle,
    Upload, Camera, X, ImageIcon,
} from 'lucide-react';

const fieldTypeOptions = [
    'Hukum Perdata', 'Hukum Pidana', 'Hukum Pidana Khusus', 'Hukum Tatanegara',
    'Hukum Administrasi Negara', 'Hukum Acara Perdata', 'Hukum Acara Pidana',
    'Hukum Agraria', 'Hukum Ekonomi', 'Hukum Ekonomi Internasional',
    'Hukum Umum', 'Hukum Internasional', 'Hukum Perdata Internasional',
    'HKI', 'HAKI', 'Manajemen', 'Ekonomi', 'Agama & Pembangunan',
    'Psikologi/ Motivasi', 'Kesehatan / Etika Profesi', 'Sosiologi', 'Lainnya',
];

interface BookFormProps {
    initialData?: Record<string, string | number | null>;
    mode: 'create' | 'edit';
    bookId?: number;
}

function BookForm({ initialData, mode, bookId }: BookFormProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(
        (initialData?.cover as string) || null
    );
    const [dragActive, setDragActive] = useState(false);

    const [form, setForm] = useState({
        title: (initialData?.title as string) || '',
        author: (initialData?.author as string) || '',
        publisher: (initialData?.publisher as string) || '',
        publish_place: (initialData?.publish_place as string) || '',
        year: initialData?.year ? String(initialData.year) : '',
        isbn: (initialData?.isbn as string) || '',
        subject: (initialData?.subject as string) || '',
        field_type: (initialData?.field_type as string) || '',
        physical_description: (initialData?.physical_description as string) || '',
        language: (initialData?.language as string) || 'Indonesia',
        location: (initialData?.location as string) || 'Bagian Hukum Kabupaten Sumedang',
        file_url: (initialData?.file_url as string) || '',
        cover: (initialData?.cover as string) || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setCoverPreview(base64);
            setForm(prev => ({ ...prev, cover: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
    };

    const removeCover = () => {
        setCoverPreview(null);
        setForm(prev => ({ ...prev, cover: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const url = mode === 'edit' ? `${apiUrl}/books/${bookId}` : `${apiUrl}/books`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
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
                setMessage({
                    type: 'success',
                    text: mode === 'edit' ? 'Buku berhasil diperbarui!' : 'Buku berhasil ditambahkan!',
                });
                if (mode === 'create') {
                    setForm({
                        title: '', author: '', publisher: '', publish_place: '',
                        year: '', isbn: '', subject: '', field_type: '',
                        physical_description: '', language: 'Indonesia',
                        location: 'Bagian Hukum Kabupaten Sumedang', file_url: '', cover: '',
                    });
                    setCoverPreview(null);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Gagal menyimpan buku' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Gagal menghubungi server' });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem',
        marginBottom: '0.5rem', fontWeight: 500,
    };

    return (
        <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', paddingTop: '6rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => router.push('/admin/books')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', border: 'none', cursor: 'pointer',
                        borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)', fontSize: '0.9rem',
                    }}
                >
                    <ArrowLeft size={18} /> Kembali
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BookOpen size={28} />
                        {mode === 'edit' ? 'Edit Buku' : 'Tambah Buku Hukum'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                        {mode === 'edit' ? 'Perbarui data buku' : 'Tambahkan buku baru ke perpustakaan JDIH'}
                    </p>
                </div>
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

            <form onSubmit={handleSubmit}>
                <div className="admin-form-grid">

                    {/* Left: Form Fields */}
                    <div style={{
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', borderRadius: 20, padding: '2rem',
                    }}>
                        {/* Title */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Judul Buku *</label>
                            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Masukkan judul buku hukum" style={inputStyle} />
                        </div>

                        {/* Author & Publisher */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Penulis</label>
                                <input type="text" name="author" value={form.author} onChange={handleChange} placeholder="Nama penulis" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Penerbit</label>
                                <input type="text" name="publisher" value={form.publisher} onChange={handleChange} placeholder="Nama penerbit" style={inputStyle} />
                            </div>
                        </div>

                        {/* Place, Year, ISBN */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Tempat Terbit</label>
                                <input type="text" name="publish_place" value={form.publish_place} onChange={handleChange} placeholder="Kota" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Tahun Terbit</label>
                                <input type="number" name="year" value={form.year} onChange={handleChange} placeholder="2024" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>ISBN / ISSN</label>
                                <input type="text" name="isbn" value={form.isbn} onChange={handleChange} placeholder="978-xxx-xxx" style={inputStyle} />
                            </div>
                        </div>

                        {/* Subject & Field Type */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Subjek</label>
                                <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Topik / subjek buku" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Bidang Hukum</label>
                                <select name="field_type" value={form.field_type} onChange={handleChange} style={{ ...inputStyle, appearance: 'none' as const }}>
                                    <option value="" style={{ background: 'var(--bg-secondary)' }}>Pilih bidang</option>
                                    {fieldTypeOptions.map(ft => (
                                        <option key={ft} value={ft} style={{ background: 'var(--bg-secondary)' }}>{ft}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Physical Description */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={labelStyle}>Deskripsi Fisik</label>
                            <input type="text" name="physical_description" value={form.physical_description} onChange={handleChange} placeholder="Contoh: 263 hlm; 21 cm" style={inputStyle} />
                        </div>

                        {/* Language & Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Bahasa</label>
                                <input type="text" name="language" value={form.language} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Lokasi</label>
                                <input type="text" name="location" value={form.location} onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        {/* File URL */}
                        <div style={{ marginBottom: 0 }}>
                            <label style={labelStyle}>URL File (PDF)</label>
                            <input type="url" name="file_url" value={form.file_url} onChange={handleChange} placeholder="https://..." style={inputStyle} />
                        </div>
                    </div>

                    {/* Right: Cover Upload */}
                    <div style={{
                        background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem',
                    }}>
                        <label style={{ ...labelStyle, marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <ImageIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                            Sampul Buku
                        </label>

                        {coverPreview ? (
                            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
                                <Image
                                    src={coverPreview}
                                    alt="Cover preview"
                                    width={248}
                                    height={350}
                                    style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 12 }}
                                />
                                <button onClick={removeCover} type="button" style={{
                                    position: 'absolute', top: 8, right: 8,
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)', border: 'none',
                                    color: '#fff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    borderRadius: 16, padding: '2rem 1rem',
                                    textAlign: 'center', cursor: 'pointer',
                                    transition: 'all 0.2s', marginBottom: '1rem',
                                    background: dragActive ? 'rgba(59,130,246,0.05)' : 'transparent',
                                    minHeight: 200, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center', gap: 12,
                                }}
                            >
                                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                                        Klik atau seret gambar
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                                        JPG, PNG, WebP (maks 5MB)
                                    </p>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />

                        {/* Camera button for mobile */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '0.6rem', borderRadius: 10, border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                            }}>
                                <Upload size={15} /> Upload
                            </button>
                            <button type="button" onClick={() => cameraInputRef.current?.click()} style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '0.6rem', borderRadius: 10, border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                            }}>
                                <Camera size={15} /> Kamera
                            </button>
                        </div>

                        {/* Or enter URL manually */}
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Atau URL sampul</label>
                            <input
                                type="url" name="cover" value={form.cover.startsWith('data:') ? '' : form.cover}
                                onChange={(e) => {
                                    setForm({ ...form, cover: e.target.value });
                                    setCoverPreview(e.target.value || null);
                                }}
                                placeholder="https://..."
                                style={{ ...inputStyle, fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: '1.5rem' }}>
                    <button
                        type="submit"
                        disabled={loading || !form.title}
                        style={{
                            width: '100%', padding: '1rem', borderRadius: 14, border: 'none',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            color: '#fff', fontSize: '1rem', fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading || !form.title ? 0.6 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? (
                            <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
                        ) : (
                            <><Save size={20} /> {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Buku'}</>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input:focus, select:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
                @media (max-width: 768px) {
                    form > div:first-child { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </main>
    );
}

// Page wrapper for "Tambah Buku"
export default function TambahBukuPage() {
    return (
        <AuthGuard requireAdmin>
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <Navbar />
                <BookForm mode="create" />
            </div>
        </AuthGuard>
    );
}

// Export the reusable form component
export { BookForm, fieldTypeOptions };
