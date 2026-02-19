'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import {
  ArrowRight,
  Shield,
  Search,
  Download,
  BookMarked,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  const features = [
    {
      icon: BookMarked,
      title: 'Koleksi Buku Hukum',
      description: 'Akses koleksi buku & dokumen hukum dari perpustakaan JDIH Sumedang secara online',
      color: 'rgba(249, 115, 22, 0.15)',
      iconColor: 'var(--primary)',
    },
    {
      icon: Download,
      title: 'Download Dokumen',
      description: 'Unduh Perda, Perbup, SK, dan dokumen hukum lainnya dalam format PDF',
      color: 'rgba(234, 88, 12, 0.15)',
      iconColor: 'var(--secondary)',
    },
    {
      icon: Search,
      title: 'Pencarian Cepat',
      description: 'Temukan buku hukum yang Anda butuhkan dengan pencarian yang powerful',
      color: 'rgba(251, 146, 60, 0.15)',
      iconColor: 'var(--accent)',
    },
    {
      icon: Sparkles,
      title: 'Rekomendasi AI',
      description: 'Sistem rekomendasi cerdas yang menyarankan buku terkait berdasarkan minat Anda',
      color: 'rgba(22, 163, 74, 0.15)',
      iconColor: 'var(--success)',
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          paddingTop: 'calc(var(--navbar-height) + 80px)',
          paddingBottom: 80,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Orange glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="animate-in" style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          {/* Logo */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            overflow: 'hidden',
            margin: '0 auto 28px',
            boxShadow: '0 8px 40px rgba(249, 115, 22, 0.25)',
            border: '2px solid var(--primary)',
          }}>
            <Image src="/logo-app.png" alt="JDIH" width={80} height={80} />
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.15)',
              borderRadius: 100,
              fontSize: '0.8125rem',
              color: 'var(--primary)',
              fontWeight: 500,
              marginBottom: 24,
            }}
          >
            <Shield size={14} />
            Perpustakaan Digital Resmi
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}
          >
            Perpustakaan Digital
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              JDIH Sumedang
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto 40px',
            }}
          >
            Akses koleksi buku hukum dari Perpustakaan JDIH Kabupaten Sumedang.
            Jelajahi Perda, Perbup, SK, dan dokumen hukum lainnya secara digital.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
            <Link href="/books" className="btn btn-ghost btn-lg">
              Jelajahi Katalog
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glass-card animate-in-delay-${index < 4 ? index : 3}`}
                style={{ padding: 28, cursor: 'default' }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: feature.color,
                    color: feature.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '32px 24px',
          borderTop: '1px solid var(--divider)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        © 2026 Perpustakaan JDIH Kabupaten Sumedang. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
}
