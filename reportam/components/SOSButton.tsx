"use client";

import { Button } from "@/components/ui/button";
import { Alert02Icon } from "hugeicons-react";
import { useRouter } from "next/navigation";

export function SOSButton() {
    const router = useRouter();

    const handleSOSClick = () => {
        router.push("/sos");
    };

    return (
        <Button
            variant="destructive"
            onClick={handleSOSClick}
            className="gap-2 rounded-lg bg-[#D32F2F] hover:bg-[#b71c1c] text-white shadow-red-200 shadow-md border border-[#b71c1c] h-10 px-3 sm:px-5 font-bold transition-all hover:scale-105 active:scale-95"
        >
            <Alert02Icon className="h-5 w-5 animate-pulse" />
            <span className="hidden sm:inline">SOS</span>
        </Button>
    );
}
