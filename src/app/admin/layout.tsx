"use client";

import React, { useEffect } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return; // Wait until loading is complete

        if (!user) {
            // If no user, redirect to login
            router.push('/login');
        } else if (user.role !== 'admin') {
            // If user is not admin, redirect to dashboard
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Show a loader while checking auth state or if user is not yet confirmed as admin
    if (isLoading || !user || user.role !== 'admin') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // If user is confirmed admin, render the layout
    return (
        <SidebarProvider open={isSidebarOpen} onOpenChange={setSidebarOpen}>
            <div className="flex min-h-screen bg-muted/40">
                <SidebarNav />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-4 sm:p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
