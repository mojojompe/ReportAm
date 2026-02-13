"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SOSButton } from "./SOSButton";

export function Navbar() {
    return (
        <header className="fixed top-0 z-40 w-full bg-background/80 backdrop-blur-md py-4">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex flex-col gap-0.5">
                    <span className="text-xl text-[#047857] font-bold font-display tracking-tight leading-none">ReportAm</span>
                    <span className="text-[10px] text-[#64748B] font-medium leading-none hidden sm:block">Community Report Platform for Oyo State</span>
                </Link>
                <nav className="flex items-center gap-2 sm:gap-4">
                    <Link href="/report">
                        <Button className="gap-2 bg-[#047857] hover:bg-[#047857] text-white rounded-lg shadow-sm border border-[#047857] h-10 px-3 sm:px-5 font-semibold transition-all active:scale-95 text-sm sm:text-base">
                            <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden xs:inline sm:inline">Report Issue</span>
                            <span className="xs:hidden sm:hidden">Report</span>
                        </Button>
                    </Link>
                    <SOSButton />
                </nav>
            </div>
        </header>
    );
}
