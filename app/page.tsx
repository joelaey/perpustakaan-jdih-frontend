'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { ArrowRight, BookOpen, Search, Download, Bookmark } from 'lucide-react';
import { booksAPI } from '@/lib/api';
import { Book, BookCard } from '@/components/BookCard';

export default function HomePage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(isAdmin ? '/admin/dashboard' : '/pengguna');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { });
    }
  }, []);

  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    setLoadingBooks(true);
    booksAPI.getAll({ limit: 5, sort: 'newest' })
      .then(res => setRecentBooks(res.data.data || []))
      .catch(() => setRecentBooks([]))
      .finally(() => setLoadingBooks(false));
  }, []);

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }



  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero animate-in">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            <Image src="/logo-awal-jdihn-small.png" alt="JDIH" width={64} height={64} />
            <Image src="/lambang-sumedang.png" alt="Kabupaten Sumedang" width={64} height={64} />
          </div>
          <h1>
            Perpustakaan Digital<br />
            <span className="accent">Buku Hukum JDIH</span>
          </h1>
          <p>
            Akses koleksi buku hukum terlengkap dari Perpustakaan JDIH Kabupaten Sumedang.
            Jelajahi berbagai literatur, referensi, dan modul pembelajaran hukum yang tersedia secara digital.
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
          {loadingBooks ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`book-card animate-in-delay-${Math.min(i, 3)}`}>
                <div className="skeleton" style={{ aspectRatio: '2/3', width: '100%' }} />
                <div style={{ paddingTop: 14 }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))
          ) : recentBooks.length > 0 ? (
            recentBooks.map((book: Book, i: number) => (
              <BookCard key={book.id} book={book} delay={Math.min(i, 3)} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Belum ada buku terbaru</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '0 0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-label">Layanan Perpustakaan</span>
        </div>
        <div className="news-grid">
          <div className="news-card animate-in">
            <div className="card-bar" style={{ background: 'var(--success)' }} />
            <div className="card-image" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800" alt="Search Books" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              <Search size={48} style={{ color: 'white', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </div>
            <div className="card-label">Eksplorasi</div>
            <div className="card-title">Pencarian Buku Real-time & Cerdas berbasis AI</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '24px', marginTop: '4px', lineHeight: 1.5 }}>Temukan buku hukum incaran Anda dalam hitungan detik. Fitur pencarian otomatis menampilkan hasil seketika lengkap dengan rekomendasi cerdas dari AI.</p>
          </div>

          <div className="news-card animate-in-delay-1">
            <div className="card-bar" style={{ background: 'var(--accent)' }} />
            <div className="card-image" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800" alt="Digital Access" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
              <Download size={56} style={{ color: 'white', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </div>
            <div className="card-label">Akses Digital</div>
            <div className="card-title">Baca Langsung & Unduh PDF Buku Hukum Gratis</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '24px', marginTop: '4px', lineHeight: 1.5 }}>Tidak perlu repot datang ke perpustakaan. Akses, baca langsung di layar Anda, atau unduh versi PDF dari ratusan koleksi buku digital kapan saja.</p>
          </div>

          <div className="news-card animate-in-delay-2">
            <div className="card-bar" style={{ background: 'var(--warning)' }} />
            <div className="card-image" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800" alt="Physical Borrowing" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              <Bookmark size={48} style={{ color: 'white', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </div>
            <div className="card-label">Peminjaman</div>
            <div className="card-title">Reservasi & Pinjam Fisik Buku Hukum ke Lokasi</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '24px', marginTop: '4px', lineHeight: 1.5 }}>Buku fisiknya tersedia di rak kami? Ajukan peminjaman langsung melalui platform secara online dan ambil bukunya di Bagian Hukum JDIH Sumedang.</p>
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
