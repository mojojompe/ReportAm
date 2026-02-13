"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    CheckCircle,
    BarChart3,
    Building2,
    LogOut,
    Menu,
    X,
    MessageSquare,
    MapPin
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const sidebarLinks = [
    {
        title: "Active Reports",
        href: "/reports",
        icon: FileText,
        showCount: true,
    },
    {
        title: "Resolved",
        href: "/resolved",
        icon: CheckCircle,
    },
    {
        title: "Comments",
        href: "/comments",
        icon: MessageSquare,
    },
    {
        title: "LGA Stats",
        href: "/stats/lga",
        icon: MapPin,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [activeCount, setActiveCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchActiveCount = async () => {
            try {
                const data = await adminApi.getReports();
                const active = data.filter((r: any) => r.status !== "resolved");
                setActiveCount(active.length);
            } catch (error) {
                console.error("Failed to fetch active count:", error);
            }
        };
        fetchActiveCount();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        authService.logout();
        toast.success("Logged out successfully");
        router.push("/login");
    };

    const sidebarContent = (
        <>
            <div className="p-6">
                <h1 className="text-xl font-bold">ReportAm</h1>
                <p className="text-xs text-white/70">Admin Dashboard</p>
            </div>

            <div className="flex-1 px-4 space-y-2">
                <Link
                    href="/"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10",
                        pathname === "/" ? "bg-white/10" : ""
                    )}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </Link>

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold uppercase text-white/50">Menu</p>
                </div>

                {sidebarLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10",
                            pathname.startsWith(link.href) ? "bg-white/10" : ""
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <link.icon className="h-5 w-5" />
                            {link.title}
                        </div>
                        {link.showCount && activeCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                                {activeCount}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            <div className="p-4 space-y-3">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>

                <div className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">ReportAm</p>
                        <p className="text-xs text-white/70">Admin Portal</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#047857] text-white shadow-lg"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop: always visible, Mobile: slide in */}
            <div
                className={cn(
                    "flex h-screen w-64 flex-col bg-[#047857] text-white transition-transform duration-300 ease-in-out",
                    "md:relative md:translate-x-0", // Desktop: always visible
                    "fixed top-0 left-0 z-40", // Mobile: fixed positioning
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0" // Mobile: slide in/out
                )}
            >
                {sidebarContent}
            </div>
        </>
    );
}
