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
import { initializeFirebase } from '@/firebase';
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
    const { auth } = initializeFirebase();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const tokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh to get latest claims
                    const userRole = tokenResult.claims.role || 'user'; // Get role from custom claims

                    setUser({
                        uid: firebaseUser.uid,
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        role: userRole,
                    });
                } catch (error) {
                    console.error("Error getting user token result:", error);
                    // Handle error, maybe sign out user
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [auth]);

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
        // The admin role can be set manually in the Firebase console for a demo user.
        // After signup, the user will have a 'user' role by default.
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
