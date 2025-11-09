"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { apiFetch } from '@/lib/api'; // We'll create this helper

// --- Types ---
interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<User>;
    signup: (name: string, email: string, password: string) => Promise<User>;
    logout: () => void;
    isLoading: boolean;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => getCookie('auth_token') || null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Effect to fetch user data if a token exists
    useEffect(() => {
        const validateToken = async () => {
            const cookieToken = getCookie('auth_token');
            if (cookieToken) {
                try {
                    const userData = await apiFetch('/users/me');
                    setUser(userData);
                    setToken(cookieToken as string);
                } catch (error) {
                    console.error("Session validation failed:", error);
                    deleteCookie('auth_token');
                    setUser(null);
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        validateToken();
    }, []);

    // --- Core Functions ---

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const { access_token } = await apiFetch('/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
                includeAuth: false, // Don't send auth token to login endpoint
            });
            
            setCookie('auth_token', access_token, { maxAge: 60 * 60 * 24 }); // 1 day
            
            const userData = await apiFetch('/users/me', {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            setUser(userData);
            setToken(access_token);
            setIsLoading(false);
            return userData;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };
    
    const signup = async (name: string, email: string, password: string) => {
        const newUser = await apiFetch('/users/', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            includeAuth: false,
        });
        return newUser;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        deleteCookie('auth_token');
        router.push('/login');
    };

    const value = { user, token, login, signup, logout, isLoading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Hook ---
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
