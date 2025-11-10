"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Ensure you have this file
import { Loader2 } from 'lucide-react';

// --- Types ---
interface User {
    uid: string;
    name: string | null;
    email: string | null;
    role: string; // Add role to our user model
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (name: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const tokenResult = await firebaseUser.getIdTokenResult();
                const userRole = tokenResult.claims.role || 'user'; // Get role from custom claims

                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    role: userRole,
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
        const tokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
        const role = tokenResult.claims.role || 'user';
        return {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            role,
        };
    };

    const login = async (email: string, password: string): Promise<User> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const mappedUser = await mapFirebaseUser(userCredential.user);
        setUser(mappedUser);
        return mappedUser;
    };

    const signup = async (name: string, email: string, password: string): Promise<User> => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // NOTE: In a real app, setting a custom claim like 'role' requires a backend (e.g., Cloud Function).
        // For this demo, the role will default to 'user' on the client side.
        // The admin role can be set manually in the Firebase console for the demo user.
        const mappedUser = await mapFirebaseUser(userCredential.user);
        setUser(mappedUser);
        return mappedUser;
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        router.push('/login');
    };
    
    const getIdToken = async (): Promise<string | null> => {
        if (auth.currentUser) {
            return auth.currentUser.getIdToken();
        }
        return null;
    };


    const value = { user, isLoading, login, signup, logout, getIdToken };

    return (
        <AuthContext.Provider value={value}>
            {isLoading ? (
                <div className="flex h-screen w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                children
            )}
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
