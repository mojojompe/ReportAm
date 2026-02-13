"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === "/login") {
            return;
        }

        // Check if user is authenticated
        if (mounted && !authService.isAuthenticated()) {
            router.push("/login");
        }
    }, [pathname, router, mounted]);

    // If on login page, render without sidebar
    if (pathname === "/login") {
        return <>{children}</>;
    }

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    // Only render children if authenticated
    if (!authService.isAuthenticated()) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 max-h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
