'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, Menu, X, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, isAdmin, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileToggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handler = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 10);

            // Hide navbar on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setHidden(true);
            } else if (currentScrollY < lastScrollY) {
                setHidden(false);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) &&
                mobileToggleRef.current && !mobileToggleRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themeButtons = [
        { value: 'light' as const, icon: Sun },
        { value: 'dark' as const, icon: Moon },
        { value: 'system' as const, icon: Monitor },
    ];

    const isAdminRoute = pathname.startsWith('/admin');

    const leftLinks = isAuthenticated && isAdmin && isAdminRoute
        ? [
            { href: '/admin/dashboard', label: 'Panel Admin' },
        ]
        : isAuthenticated && !isAdmin
            ? [
                { href: '/pengguna', label: 'Dashboard' },
            ]
            : [
                { href: '/', label: 'Home' },
                { href: '/books', label: 'Buku' },
                { href: '/tentang', label: 'Tentang' },
            ];

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${hidden ? 'hidden' : ''}`}>
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
                <Link href={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/pengguna') : '/'} className="navbar-center">
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
                        <div className="profile-dropdown" ref={profileRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="profile-trigger"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                                    cursor: 'pointer', font: 'inherit', fontSize: '0.9rem',
                                    padding: '6px 10px', borderRadius: 8,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {user?.avatar ? (
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%', overflow: 'hidden',
                                        position: 'relative', border: '1px solid var(--glass-border)'
                                    }}>
                                        <Image src={user.avatar} alt="Avatar" fill style={{ objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <UserIcon size={16} />
                                )}
                                <span>{user?.name?.split(' ')[0]}</span>
                                <ChevronDown size={14} style={{
                                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s',
                                }} />
                            </button>

                            {profileOpen && (
                                <div className="profile-menu" style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                    background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--glass-border)', borderRadius: 12,
                                    padding: '8px', minWidth: 180, zIndex: 1000,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                    animation: 'fadeSlideDown 0.2s ease',
                                }}>
                                    <div style={{
                                        padding: '10px 12px', borderBottom: '1px solid var(--glass-border)',
                                        marginBottom: 4,
                                    }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {user?.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {user?.email}
                                        </div>
                                    </div>
                                    <Link href="/admin/profile" style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem',
                                        color: 'var(--text-secondary)', textDecoration: 'none',
                                        transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <UserIcon size={14} /> Profil Saya
                                    </Link>
                                    <button onClick={logout} style={{
                                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                                        padding: '8px 12px', borderRadius: 8, fontSize: '0.85rem',
                                        color: '#ef4444', background: 'none', border: 'none',
                                        cursor: 'pointer', font: 'inherit', textAlign: 'left',
                                        transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <LogOut size={14} /> Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login">Masuk</Link>
                            <Link href="/register" className="btn btn-primary btn-sm" style={{ color: '#fff' }}>Daftar</Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button ref={mobileToggleRef} className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <div ref={mobileMenuRef} className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
                {leftLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        {link.label}
                    </Link>
                ))}
                {!isAuthenticated && (
                    <>
                        <Link href="/login">Masuk</Link>
                    </>
                )}
                {isAuthenticated && (
                    <>
                        <Link href="/admin/profile">Profil Saya</Link>
                        <button onClick={logout} className="mobile-logout">
                            Keluar
                        </button>
                    </>
                )}
                <div className="mobile-theme-row">
                    {themeButtons.map(({ value, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={theme === value ? 'active' : ''}
                            style={{
                                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--glass-border)', borderRadius: 8, background: theme === value ? 'var(--accent-bg)' : 'transparent',
                                color: theme === value ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', padding: 0
                            }}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
