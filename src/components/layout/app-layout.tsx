"use client";

import React, { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Header } from "@/components/layout/header";
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type AppLayoutProps = {
    children: React.ReactNode;
};

const PROTECTED_ROUTES = ['/dashboard', '/analytics', '/profile', '/admin'];

export default function AppLayout({ children }: AppLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user && PROTECTED_ROUTES.includes(pathname)) {
            router.push('/login');
        }
    }, [user, isLoading, router, pathname]);

    if (isLoading || (!user && PROTECTED_ROUTES.includes(pathname))) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
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
