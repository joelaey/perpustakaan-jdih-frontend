'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    redirectTo?: string;
}

export default function AuthGuard({
    children,
    requireAuth = true,
    requireAdmin = false,
    redirectTo,
}: AuthGuardProps) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (requireAuth && !isAuthenticated) {
            router.push(redirectTo || '/login');
            return;
        }

        if (requireAdmin && !isAdmin) {
            router.push('/pengguna');
            return;
        }
    }, [isAuthenticated, isAdmin, isLoading, requireAuth, requireAdmin, redirectTo, router]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Memuat...
                </p>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) return null;
    if (requireAdmin && !isAdmin) return null;

    return <>{children}</>;
}
