'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { });
    }
  }, []);

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  const featuredBooks = [
    { title: 'Perda No. 1 Tahun 2024 tentang RPJMD', author: 'DPRD Kab. Sumedang', type: 'Perda' },
    { title: 'Perbup No. 15 Tahun 2023 tentang OPD', author: 'Bupati Sumedang', type: 'Perbup' },
    { title: 'SK Bupati No. 22 Tahun 2024', author: 'Bupati Sumedang', type: 'SK' },
    { title: 'Perda No. 3 Tahun 2023 tentang APBD', author: 'DPRD Kab. Sumedang', type: 'Perda' },
    { title: 'Instruksi Bupati No. 5 Tahun 2024', author: 'Bupati Sumedang', type: 'Instruksi' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero animate-in">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <Image src="/logo-app.png" alt="JDIH" width={64} height={64} />
            <Image src="/lambang-sumedang.png" alt="Kabupaten Sumedang" width={64} height={64} />
          </div>
          <h1>
            Perpustakaan Digital<br />
            <span className="accent">JDIH Kab. Sumedang</span>
          </h1>
          <p>
            Akses koleksi dokumen hukum dari Perpustakaan JDIH Kabupaten Sumedang.
            Jelajahi Perda, Perbup, SK, dan produk hukum lainnya secara digital.
          </p>
          <div className="hero-actions">
            <Link href="/books" className="btn btn-primary btn-lg">
              Jelajahi Katalog <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn btn-outline btn-lg">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div className="section-divider" />
      </div>

      {/* New & Noteworthy */}
      <section style={{ padding: '0 0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-label">Koleksi Terbaru</span>
        </div>
        <div className="featured-row">
          {featuredBooks.map((book, i) => (
            <Link href="/books" key={i} className={`book-card animate-in-delay-${Math.min(i, 3)}`}>
              <div className="book-cover">
                <div className="no-cover">
                  <BookOpen size={40} />
                </div>
              </div>
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* News Section (LOA-style 3-column) */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="news-grid">
          <div className="news-card animate-in">
            <div className="card-bar" />
            <div className="card-image" style={{ background: 'linear-gradient(135deg, var(--accent-bg) 0%, var(--surface) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={48} style={{ color: 'var(--accent)', opacity: 0.6 }} />
            </div>
            <div className="card-label">Koleksi</div>
            <div className="card-title">Koleksi terbaru buku hukum dari perpustakaan JDIH Sumedang</div>
            <div className="card-date">Februari 2026</div>
          </div>

          <div className="news-card animate-in-delay-1">
            <div className="card-bar" />
            <div className="card-image wide" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #3d3d3d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', padding: 24 }}>
                Peraturan Daerah &amp; Hukum Kabupaten Sumedang
              </span>
            </div>
            <div className="card-label">Informasi</div>
            <div className="card-title">Akses dokumen hukum resmi Kabupaten Sumedang secara digital</div>
          </div>

          <div className="news-card animate-in-delay-2">
            <div className="card-bar" />
            <div className="card-image" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--accent-bg) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>AI</span>
            </div>
            <div className="card-label">Fitur Baru</div>
            <div className="card-title">Rekomendasi buku cerdas berdasarkan minat Anda</div>
            <div className="card-date">Februari 2026</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        © 2026 Perpustakaan JDIH Kabupaten Sumedang. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
