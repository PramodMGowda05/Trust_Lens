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
import { useFirebase } from '@/firebase'; 
import { Loader2 } from 'lucide-react';

interface User {
    uid: string;
    name: string | null;
    email: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User>;
    signup: (name: string, email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    
    const { auth } = useFirebase();

    useEffect(() => {
        if (!auth) {
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const mappedUser = {
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                };
                setUser(mappedUser);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
        return {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
        };
    };

    const login = async (email: string, password: string): Promise<User> => {
        if (!auth) throw new Error("Auth service not initialized.");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const mappedUser = await mapFirebaseUser(userCredential.user);
        setUser(mappedUser);
        return mappedUser;
    };

    const signup = async (name: string, email: string, password: string): Promise<User> => {
        if (!auth) throw new Error("Auth service not initialized.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const newUser: User = {
             uid: userCredential.user.uid,
             name: name,
             email: userCredential.user.email,
        };
        setUser(newUser);
        return await mapFirebaseUser(userCredential.user);
    };

    const logout = async () => {
        if (!auth) throw new Error("Auth service not initialized.");
        await signOut(auth);
        setUser(null);
        router.push('/login');
    };
    
    const getIdToken = async (): Promise<string | null> => {
        if (auth?.currentUser) {
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
