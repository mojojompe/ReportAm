"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Add01Icon } from "hugeicons-react";
import { SOSButton } from "./SOSButton";

export function Navbar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-white py-4">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">
                <Link href="/" className="flex flex-col gap-0.5">
                    <span className="text-2xl text-[#047857] font-bold font-display tracking-tight leading-none">ReportAm</span>
                    <span className="text-sm text-[#64748B] font-medium leading-none hidden sm:block">Community Reporting for Oyo</span>
                </Link>
                <nav className="flex items-center gap-3 sm:gap-4">
                    <Link href="/report">
                        <Button className="gap-2 bg-[#047857] hover:bg-[#059669] text-white rounded-lg shadow-sm h-11 px-4 sm:px-6 font-semibold transition-all active:scale-95 text-sm sm:text-base">
                            <Add01Icon className="h-5 w-5" />
                            <span>Report</span>
                        </Button>
                    </Link>
                    <SOSButton />
                </nav>
            </div>
        </header>
    );
}
