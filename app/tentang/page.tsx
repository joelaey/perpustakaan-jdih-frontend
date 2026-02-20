'use client';

import React from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { MapPin, Clock, Phone, Mail, BookOpen, Scale, Users, Building2, ExternalLink } from 'lucide-react';

export default function TentangPage() {
    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            {/* Hero Section */}
            <section className="tentang-hero animate-in">
                <div className="tentang-hero-overlay" />
                <div className="tentang-hero-content">
                    <div className="tentang-logos">
                        <Image src="/logo-awal-jdihn-small.png" alt="JDIH" width={72} height={72} />
                        <Image src="/lambang-sumedang.png" alt="Kabupaten Sumedang" width={72} height={72} />
                    </div>
                    <span className="section-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Tentang Kami</span>
                    <h1>
                        Perpustakaan JDIH<br />
                        <span className="accent">Kabupaten Sumedang</span>
                    </h1>
                    <p>
                        Jaringan Dokumentasi dan Informasi Hukum — menyediakan akses terbuka
                        terhadap produk hukum daerah Kabupaten Sumedang secara digital, transparan, dan akuntabel.
                    </p>
                </div>
            </section>

            {/* About Content */}
            <div className="tentang-container">

                {/* Tentang Section */}
                <section className="tentang-section animate-in">
                    <div className="tentang-section-header">
                        <span className="section-label">Tentang JDIH</span>
                        <h2>Apa Itu JDIH?</h2>
                    </div>
                    <div className="tentang-text-block">
                        <p>
                            <strong>Jaringan Dokumentasi dan Informasi Hukum (JDIH)</strong> adalah wadah pendayagunaan bersama atas
                            dokumen hukum secara tertib, terpadu, dan berkesinambungan. JDIH Kabupaten Sumedang bertujuan untuk
                            menjamin terciptanya pengelolaan dokumentasi dan informasi hukum yang terpadu dan terintegrasi di lingkungan
                            Pemerintah Kabupaten Sumedang.
                        </p>
                        <p>
                            Perpustakaan JDIH Kabupaten Sumedang hadir sebagai bentuk komitmen pemerintah daerah dalam memberikan
                            akses seluas-luasnya kepada masyarakat terhadap berbagai produk hukum daerah, mulai dari Peraturan Daerah (Perda),
                            Peraturan Bupati (Perbup), Surat Keputusan (SK), hingga produk hukum lainnya.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="section-divider" />

                {/* Visi & Misi */}
                <section className="tentang-section animate-in">
                    <div className="tentang-section-header">
                        <span className="section-label">Visi & Misi</span>
                        <h2>Tujuan Kami</h2>
                    </div>
                    <div className="tentang-visi-misi">
                        <div className="visi-card">
                            <div className="visi-card-icon">
                                <Scale size={32} />
                            </div>
                            <h3>Visi</h3>
                            <p>
                                Mewujudkan masyarakat Kabupaten Sumedang yang sadar hukum melalui
                                kemudahan akses informasi dan dokumentasi hukum yang lengkap, akurat, dan terpercaya.
                            </p>
                        </div>
                        <div className="misi-card">
                            <h3>Misi</h3>
                            <ul>
                                <li>
                                    <span className="misi-number">01</span>
                                    <span>Menyediakan akses informasi hukum yang mudah dan terbuka bagi seluruh masyarakat</span>
                                </li>
                                <li>
                                    <span className="misi-number">02</span>
                                    <span>Mengelola dokumentasi produk hukum daerah secara tertib dan terstruktur</span>
                                </li>
                                <li>
                                    <span className="misi-number">03</span>
                                    <span>Memanfaatkan teknologi digital untuk pelayanan informasi hukum yang modern</span>
                                </li>
                                <li>
                                    <span className="misi-number">04</span>
                                    <span>Meningkatkan kesadaran hukum masyarakat Kabupaten Sumedang</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div className="section-divider" />

                {/* Layanan */}
                <section className="tentang-section animate-in">
                    <div className="tentang-section-header">
                        <span className="section-label">Layanan</span>
                        <h2>Apa yang Kami Sediakan</h2>
                    </div>
                    <div className="tentang-layanan-grid">
                        <div className="layanan-card">
                            <div className="layanan-icon">
                                <BookOpen size={28} />
                            </div>
                            <h3>Koleksi Digital</h3>
                            <p>Akses ribuan dokumen hukum dalam format digital yang mudah dibaca dan diunduh.</p>
                        </div>
                        <div className="layanan-card">
                            <div className="layanan-icon">
                                <Scale size={28} />
                            </div>
                            <h3>Produk Hukum</h3>
                            <p>Perda, Perbup, SK, Instruksi, dan berbagai produk hukum daerah Kabupaten Sumedang.</p>
                        </div>
                        <div className="layanan-card">
                            <div className="layanan-icon">
                                <Users size={28} />
                            </div>
                            <h3>Konsultasi Hukum</h3>
                            <p>Layanan bantuan dan konsultasi terkait informasi produk hukum daerah.</p>
                        </div>
                        <div className="layanan-card">
                            <div className="layanan-icon">
                                <Building2 size={28} />
                            </div>
                            <h3>Ruang Baca</h3>
                            <p>Fasilitas ruang baca yang nyaman untuk membaca dan menelaah dokumen hukum.</p>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div className="section-divider" />

                {/* Lokasi & Kontak */}
                <section className="tentang-section animate-in">
                    <div className="tentang-section-header">
                        <span className="section-label">Lokasi & Kontak</span>
                        <h2>Kunjungi Kami</h2>
                    </div>

                    <div className="tentang-lokasi-grid">
                        {/* Map */}
                        <div className="tentang-map-wrapper">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d989.6!2d107.9187694!3d-6.8389861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68d13219534c1d%3A0x5ee3a36d397b40f5!2sIPP%20Sumedang!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                                width="100%"
                                height="100%"
                                style={{ border: 0, borderRadius: 8 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi Perpustakaan JDIH Sumedang"
                            />
                        </div>

                        {/* Contact Info */}
                        <div className="tentang-kontak-info">
                            <div className="kontak-item">
                                <div className="kontak-icon">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4>Alamat</h4>
                                    <p>
                                        Induk Pusat Pemerintahan (IPP) Sumedang<br />
                                        Jl. Prabu Gajah Agung, RT.4/RW.2, Situ,<br />
                                        Kec. Sumedang Utara, Kabupaten Sumedang,<br />
                                        Jawa Barat 45621
                                    </p>
                                </div>
                            </div>

                            <div className="kontak-item">
                                <div className="kontak-icon">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h4>Jam Operasional</h4>
                                    <p>
                                        Senin — Jumat: 08.00 — 16.00 WIB<br />
                                        Sabtu — Minggu: Tutup
                                    </p>
                                </div>
                            </div>

                            <div className="kontak-item">
                                <div className="kontak-icon">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h4>Telepon</h4>
                                    <p>(0261) 201545</p>
                                </div>
                            </div>

                            <div className="kontak-item">
                                <div className="kontak-icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4>Email</h4>
                                    <p>jdih@sumedangkab.go.id</p>
                                </div>
                            </div>

                            <a
                                href="https://maps.app.goo.gl/8rEM8eE38fCW9SG87"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{ marginTop: 8, width: 'fit-content' }}
                            >
                                Buka di Google Maps <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="site-footer">
                © 2026 Perpustakaan JDIH Kabupaten Sumedang. Hak Cipta Dilindungi.
            </footer>
        </div>
    );
}
