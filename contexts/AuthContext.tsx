'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'pengguna';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('jdih_token');
        const savedUser = localStorage.getItem('jdih_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('jdih_token');
                localStorage.removeItem('jdih_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        const { token: newToken, user: newUser } = response.data.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('jdih_token', newToken);
        localStorage.setItem('jdih_user', JSON.stringify(newUser));
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const response = await authAPI.register(name, email, password);
        const { token: newToken, user: newUser } = response.data.data;

        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('jdih_token', newToken);
        localStorage.setItem('jdih_user', JSON.stringify(newUser));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('jdih_token');
        localStorage.removeItem('jdih_user');
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
