"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Siren } from "lucide-react";
import { reportApi } from "@/lib/api";
import { toast } from "sonner";

export function SOSButton() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSOSClick = async () => {
        setIsSubmitting(true);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        await reportApi.triggerSOS({ lat: latitude, lng: longitude });
                        toast.success("SOS alert sent successfully!");
                    } catch (error: any) {
                        console.error("SOS error:", error);
                        const errorMsg = error?.response?.data?.message || "Failed to send SOS alert";
                        toast.error(errorMsg);
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast.error("Location access denied. Please enable location services.");
                    setIsSubmitting(false);
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
            setIsSubmitting(false);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleSOSClick}
            disabled={isSubmitting}
            className="gap-2 rounded-lg bg-[#D32F2F] hover:bg-[#b71c1c] text-white shadow-red-200 shadow-md border border-[#b71c1c] h-10 px-3 sm:px-5 font-bold transition-all hover:scale-105 active:scale-95"
        >
            <Siren className={`h-5 w-5 ${isSubmitting ? '' : 'animate-pulse'}`} />
            <span className="hidden sm:inline">{isSubmitting ? "Sending..." : "SOS"}</span>
        </Button>
    );
}
