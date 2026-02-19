'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
    BookOpen,
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    User,
    Menu,
    X,
    Search,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navLinks = isAdmin
        ? [
            { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/books', label: 'Kelola Buku', icon: BookOpen },
            { href: '/admin/users', label: 'Kelola Users', icon: Users },
        ]
        : [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/books', label: 'Katalog Buku', icon: BookOpen },
        ];

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const themeButtons = [
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* Brand */}
            <Link href={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className="navbar-brand">
                <div className="brand-icon">
                    <Image src="/logo-app.png" alt="JDIH" width={36} height={36} />
                </div>
                <span>JDIH Sumedang</span>
            </Link>

            {/* Navigation Links */}
            {isAuthenticated && (
                <ul className="navbar-nav">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={pathname === link.href ? 'active' : ''}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {/* Actions */}
            <div className="navbar-actions">
                {/* Theme Toggle */}
                <div className="theme-toggle">
                    {themeButtons.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={theme === value ? 'active' : ''}
                            title={label}
                        >
                            <Icon size={15} />
                        </button>
                    ))}
                </div>

                {isAuthenticated ? (
                    <>
                        {/* Search Button */}
                        <button
                            className="btn btn-icon btn-ghost"
                            title="Cari Buku"
                            onClick={() => router.push('/books')}
                        >
                            <Search size={18} />
                        </button>

                        {/* User Dropdown */}
                        <div className="dropdown" ref={dropdownRef}>
                            <button
                                className="user-avatar"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                title={user?.name}
                            >
                                {user ? getInitials(user.name) : 'U'}
                            </button>

                            <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                                <div className="dropdown-header">
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                        {user?.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', marginTop: 2 }}>{user?.email}</div>
                                    <span
                                        className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}
                                        style={{ marginTop: 6 }}
                                    >
                                        {user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                                    </span>
                                </div>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item" onClick={() => { setDropdownOpen(false); router.push('/profile'); }}>
                                    <User size={16} /> Profil Saya
                                </button>
                                {isAdmin && (
                                    <button className="dropdown-item" onClick={() => { setDropdownOpen(false); router.push('/admin/settings'); }}>
                                        <Settings size={16} /> Pengaturan
                                    </button>
                                )}
                                <div className="dropdown-divider" />
                                <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="btn btn-ghost btn-sm">
                            Masuk
                        </Link>
                        <Link href="/register" className="btn btn-primary btn-sm">
                            Daftar
                        </Link>
                    </>
                )}

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && isAuthenticated && (
                <div
                    style={{
                        position: 'fixed',
                        top: 'var(--navbar-height)',
                        left: 0,
                        right: 0,
                        background: 'var(--navbar-bg-scrolled)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderBottom: '1px solid var(--divider)',
                        padding: '12px',
                        zIndex: 999,
                    }}
                >
                    {/* Mobile Theme Toggle */}
                    <div style={{
                        display: 'flex', gap: 4, marginBottom: 8,
                        background: 'var(--input-bg)', borderRadius: 10, padding: 4,
                    }}>
                        {themeButtons.map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                                    background: theme === value ? 'var(--primary)' : 'transparent',
                                    color: theme === value ? 'white' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                <Icon size={14} /> {label}
                            </button>
                        ))}
                    </div>

                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '12px 16px',
                                    borderRadius: 10,
                                    color: pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    background: pathname === link.href ? 'rgba(249,115,22,0.1)' : 'transparent',
                                }}
                            >
                                <Icon size={18} /> {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
