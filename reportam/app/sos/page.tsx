"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Siren, MapPin, Phone, Camera, Image as ImageIcon, Trash2, Zap, Droplets, Droplet, Shield, Heart, MoreHorizontal, Construction, Navigation, ArrowLeft, UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import { reportApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    category: z.string().min(1, "Please select an emergency type"),
    lga: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().min(5, "Location is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
    { id: "road", label: "Road", icon: Construction },
    { id: "waste", label: "Waste", icon: Trash2 },
    { id: "drainage", label: "Drainage", icon: Droplets },
    { id: "electricity", label: "Electricity", icon: Zap },
    { id: "water", label: "Water", icon: Droplet },
    { id: "security", label: "Security", icon: Shield },
    { id: "health", label: "Health", icon: Heart },
    { id: "other", label: "Other", icon: MoreHorizontal },
];

const LGAS = [
    "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West",
    "Akinyele", "Egbeda", "Ido", "Lagelu", "Oluyole", "Ona Ara",
];

export default function SOSPage() {
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { category: "security" }
    });

    const selectedCategory = watch("category");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("image", file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLocationClick = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setValue("latitude", latitude);
                    setValue("longitude", longitude);
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        setValue("location", data.display_name || `${latitude}, ${longitude}`);
                        toast.success("Location detected!");
                    } catch {
                        setValue("location", `${latitude}, ${longitude}`);
                    }
                    setIsLocating(false);
                },
                () => {
                    toast.error("Could not detect location.");
                    setIsLocating(false);
                }
            );
        }
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title || "Emergency Report");
            formData.append("description", data.description || "Emergency reported via SOS page");
            formData.append("category", data.category);
            formData.append("location", data.location);
            if (data.latitude) formData.append("latitude", data.latitude.toString());
            if (data.longitude) formData.append("longitude", data.longitude.toString());
            if (data.image) formData.append("image", data.image);

            await reportApi.submitReport(formData);
            toast.success("Emergency Report Sent!");
            router.push("/");
        } catch {
            toast.error("Failed to send report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF5F5]">
            {/* Header */}
            <header className="fixed top-0 z-40 w-full bg-[#D32F2F] text-white shadow-md">
                <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10 rounded-full">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2">
                                <Siren className="h-5 w-5 animate-pulse" />
                                Emergency Report
                            </h1>
                            <p className="text-[11px] text-red-100 opacity-90">For urgent issues requiring immediate attention</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl space-y-6">

                {/* Call Button */}
                <a href="tel:112" className="block">
                    <Button className="w-full bg-white text-[#D32F2F] border-2 border-[#D32F2F] hover:bg-red-50 h-14 rounded-xl text-base font-bold shadow-sm transition-all hover:shadow-md">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Emergency Services (112)
                    </Button>
                </a>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Photo */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#FECDCA]">
                        <h2 className="text-base font-bold text-[#912018] mb-1">Add a Photo</h2>
                        <p className="text-sm text-[#555] mb-4">Help responders understand the situation</p>

                        <div className="border-[2px] border-dashed border-[#FECDCA] rounded-xl p-6 bg-[#FEF2F2]/50 flex flex-col items-center justify-center gap-4">
                            {previewUrl ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                    <Button type="button" variant="secondary" size="sm" className="absolute right-2 top-2 h-8 w-8 rounded-full p-0" onClick={() => { setPreviewUrl(null); setValue("image", undefined); }}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="h-12 w-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#D32F2F]">
                                        <ImageIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm text-[#D32F2F] font-medium">Add a photo of the issue</p>
                                    <div className="flex gap-3 w-full max-w-xs">
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden" capture="environment" onChange={handleImageUpload} />
                                            <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#FECDCA] bg-white text-[#D32F2F] text-sm font-semibold hover:bg-[#FEF2F2] shadow-sm">
                                                <Camera className="h-4 w-4" /> Camera
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#FECDCA] bg-white text-[#D32F2F] text-sm font-semibold hover:bg-[#FEF2F2] shadow-sm">
                                                <UploadCloud className="h-4 w-4" /> Gallery
                                            </div>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#FECDCA]">
                        <h2 className="text-base font-bold text-[#912018] mb-1">Location</h2>
                        <p className="text-sm text-[#555] mb-4">Where is this emergency?</p>

                        <div className="rounded-lg border border-[#FEDF89] bg-[#FFFAEB] p-3 flex items-center gap-3 text-[#B54708] mb-4">
                            <div className="h-4 w-4 rounded-full border-[1.5px] border-[#B54708] flex items-center justify-center text-[10px] font-bold shrink-0">!</div>
                            <span className="text-xs font-medium">Could not detect location</span>
                        </div>

                        <div className="flex gap-2">
                            <Input placeholder="Enter location manually (e.g., Bodija Market)" {...register("location")} className="h-11 border-[#E5E7EB] focus-visible:ring-[#D32F2F] placeholder:text-gray-400" />
                            <Button type="button" variant="outline" size="icon" className="h-11 w-11 shrink-0 rounded-lg border-[#E5E7EB] text-[#D32F2F] hover:bg-red-50" onClick={handleLocationClick} disabled={isLocating}>
                                <Navigation className="h-5 w-5" />
                            </Button>
                        </div>
                        {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>}
                    </div>

                    {/* Emergency Type */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#FECDCA]">
                        <h2 className="text-base font-bold text-[#912018] mb-1">Emergency Type</h2>
                        <p className="text-sm text-[#555] mb-4">What kind of emergency is this?</p>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                const isSelected = selectedCategory === category.id;
                                return (
                                    <div
                                        key={category.id}
                                        onClick={() => setValue("category", category.id)}
                                        className={cn(
                                            "cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all",
                                            isSelected ? "border-[#D32F2F] bg-[#FEF2F2] text-[#D32F2F] ring-1 ring-[#D32F2F]" : "border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F9FAFB]"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs font-medium">{category.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
                    </div>

                    {/* LGA */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#FECDCA]">
                        <h2 className="text-base font-bold text-[#912018] mb-1">Select Local Government</h2>
                        <select {...register("lga")} className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#101828] focus:border-[#D32F2F] focus:ring-1 focus:ring-[#D32F2F]">
                            <option value="">Select LGA</option>
                            {LGAS.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#FECDCA]">
                        <h2 className="text-base font-bold text-[#912018] mb-1">Brief Description</h2>
                        <div className="space-y-4">
                            <Input placeholder="e.g., Building collapse at Bodija" {...register("title")} className="h-11 border-[#E5E7EB] focus-visible:ring-[#D32F2F]" />
                            <textarea
                                {...register("description")}
                                className="min-h-[100px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F] border-gray-200"
                                placeholder="Provide any additional details..."
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#E04F47] hover:bg-[#D32F2F] text-white h-14 rounded-xl text-lg font-bold shadow-md shadow-red-200">
                        {isSubmitting ? "Sending..." : "Submit Emergency Report"}
                    </Button>
                </form>
            </main>
        </div>
    );
}
