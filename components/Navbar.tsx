'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, Menu, X, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const themeButtons = [
        { value: 'light' as const, icon: Sun },
        { value: 'dark' as const, icon: Moon },
        { value: 'system' as const, icon: Monitor },
    ];

    const leftLinks = [
        { href: '/', label: 'Home' },
        { href: '/books', label: 'Buku' },
        { href: '/tentang', label: 'Tentang' },
    ];

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                {/* Left Links */}
                <div className="navbar-left">
                    {leftLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? 'active' : ''}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Center Logo */}
                <Link href={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className="navbar-center">
                    <Image src="/logo-awal-jdihn-small.png" alt="JDIH" width={36} height={36} />
                    <span className="brand-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                        <span>Perpustakaan JDIH</span>
                        <span style={{ fontSize: '0.8em' }}>Kab. Sumedang</span>
                    </span>
                    <Image src="/lambang-sumedang.png" alt="Kabupaten Sumedang" width={36} height={36} />
                </Link>

                {/* Right Actions */}
                <div className="navbar-right">
                    {/* Theme Toggle */}
                    <div className="theme-toggle">
                        {themeButtons.map(({ value, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={theme === value ? 'active' : ''}
                                title={value}
                            >
                                <Icon size={14} />
                            </button>
                        ))}
                    </div>

                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin/dashboard" className={pathname.startsWith('/admin') ? 'active' : ''}>Dashboard</Link>
                            )}
                            <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <UserIcon size={14} />
                                {user?.name?.split(' ')[0]}
                            </Link>
                            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <LogOut size={14} /> Keluar
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Masuk</Link>
                            <Link href="/register" className="btn btn-primary btn-sm" style={{ color: '#fff' }}>Daftar</Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
                {leftLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        {link.label}
                    </Link>
                ))}
                {!isAuthenticated && (
                    <>
                        <Link href="/login">Masuk</Link>
                        <Link href="/register">Daftar</Link>
                    </>
                )}
                {isAuthenticated && (
                    <button onClick={logout} style={{ textAlign: 'left', background: 'none', border: 'none', font: 'inherit', color: 'var(--text-secondary)', padding: '10px 0', cursor: 'pointer' }}>
                        Keluar
                    </button>
                )}
                <div style={{ paddingTop: 12, display: 'flex', gap: 4 }}>
                    {themeButtons.map(({ value, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={theme === value ? 'active' : ''}
                            style={{
                                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--border)', borderRadius: 4, background: theme === value ? 'var(--accent-bg)' : 'transparent',
                                color: theme === value ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer',
                            }}
                        >
                            <Icon size={14} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
