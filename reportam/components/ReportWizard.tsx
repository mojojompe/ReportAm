"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Camera,
    Image as ImageIcon,
    Trash2,
    Zap,
    Droplets,
    Droplet,
    Shield,
    Heart,
    MoreHorizontal,
    Construction,
    Send,
    Navigation,
    ArrowLeft,
    UploadCloud
} from "lucide-react";
import { cn } from "@/lib/utils";
import { reportApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    category: z.string().min(1, "Please select a category"),
    lga: z.string().min(1, "Please select a Local Government Area"),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().optional(),
    location: z.string().min(5, "Location is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [1, 2, 3];

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

// Fallback LGAs in case API fails - Actual Oyo State LGAs
const FALLBACK_LGAS = [
    "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North",
    "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West",
    "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin",
    "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South",
    "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire",
    "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"
];

import { useEffect } from "react";

export function ReportWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [states, setStates] = useState<any[]>([]);
    const [lgas, setLgas] = useState<any[]>(FALLBACK_LGAS);

    useEffect(() => {
        const fetchLgas = async () => {
            try {
                const statesData = await reportApi.getStates();
                console.log("States API response:", statesData);

                const statesList = Array.isArray(statesData) ? statesData : (statesData.data || []);
                console.log("States list:", statesList);
                setStates(statesList); // Store states for later use

                const oyoState = statesList.find((s: any) =>
                    s.name?.toLowerCase().includes("oyo")
                );
                console.log("Found Oyo state:", oyoState);

                if (oyoState && (oyoState.id || oyoState._id)) {
                    const lgaData = await reportApi.getLgas(oyoState.id || oyoState._id);
                    console.log("LGA API response:", lgaData);

                    const lgaList = Array.isArray(lgaData) ? lgaData : (lgaData.data || []);
                    console.log("LGA list:", lgaList);

                    if (lgaList && lgaList.length > 0) {
                        setLgas(lgaList);
                    } else {
                        // Fallback to hardcoded LGAs
                        setLgas(FALLBACK_LGAS);
                    }
                } else {
                    setLgas(FALLBACK_LGAS);
                }
            } catch (error) {
                console.error("Failed to fetch LGAs:", error);
                setLgas(FALLBACK_LGAS);
            }
        };
        fetchLgas();
    }, []);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    const selectedCategory = watch("category");

    const handleNext = async () => {
        let isStepValid = false;
        if (currentStep === 1) isStepValid = await trigger(["category", "lga"]);
        else if (currentStep === 2) isStepValid = await trigger(["location"]);

        if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    };

    const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
            console.log("Form data before submission:", data);

            const formData = new FormData();

            // Backend expects these fields:
            // type, category, image, description, state_id, lga_id, address_text
            formData.append("type", "community"); // Default type
            formData.append("category", data.category);
            formData.append("description", data.description || data.title); // Use title as description if no description
            formData.append("address_text", data.location); // Map location to address_text
            formData.append("community_name", data.lga); // Use LGA as community name for now

            // Find the Oyo state ID and LGA ID
            if (states.length > 0) {
                const oyoState = states.find((s: any) => s.name?.toLowerCase().includes("oyo"));
                if (oyoState) {
                    formData.append("state_id", oyoState._id || oyoState.id);
                }
            }

            // Find LGA ID if we have the LGA list
            if (lgas.length > 0 && data.lga) {
                const selectedLga = lgas.find((l: any) => {
                    const lgaName = typeof l === 'string' ? l : l.name;
                    return lgaName === data.lga;
                });
                if (selectedLga && typeof selectedLga !== 'string') {
                    formData.append("lga_id", selectedLga._id || selectedLga.id);
                }
            }

            if (data.latitude) formData.append("lat", data.latitude.toString());
            if (data.longitude) formData.append("lng", data.longitude.toString());
            if (data.image) formData.append("image", data.image);

            // Log FormData contents
            console.log("FormData being sent:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            await reportApi.submitReport(formData);
            toast.success("Report submitted successfully!");
            router.push("/");
        } catch (error: any) {
            console.error("Submit error:", error);
            console.error("Error response:", error?.response);
            console.error("Error data:", error?.response?.data);
            console.error("Error status:", error?.response?.status);
            console.error("Error message:", error?.response?.data?.message);
            console.error("Validation errors:", error?.response?.data?.errors);

            const errorMsg = error?.response?.data?.message || error?.message || "Failed to submit report.";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12 bg-white min-h-screen md:min-h-0">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                {currentStep > 1 && (
                    <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-gray-100">
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold font-display text-[#101828]">Report an Issue</h1>
                    <p className="text-sm text-[#475467]">Help your community by reporting problems</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 flex gap-2">
                {[1, 2, 3].map((step) => (
                    <div key={step} className={cn("h-1.5 flex-1 rounded-full", step <= currentStep ? "bg-[#1B5E20]" : "bg-[#EAECF0]")} />
                ))}
            </div>
            <div className="mb-6 text-sm font-medium text-[#344054]">Step {currentStep} of 3</div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                    {/* STEP 1: CATEGORY */}
                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#101828]">Select Category</h2>
                                    <p className="text-sm text-[#475467]">What type of issue is this?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {CATEGORIES.map((category) => {
                                        const Icon = category.icon;
                                        const isSelected = selectedCategory === category.id;
                                        return (
                                            <div
                                                key={category.id}
                                                onClick={() => setValue("category", category.id, { shouldValidate: true })}
                                                className={cn(
                                                    "cursor-pointer flex flex-col items-center justify-center gap-3 rounded-xl border p-4 transition-all",
                                                    isSelected ? "border-[#6BA898] bg-[#6BA898]/5 shadow-sm ring-1 ring-[#6BA898]" : "border-[#EAECF0] bg-white hover:border-[#6BA898]/50 hover:bg-[#F9FAFB]"
                                                )}
                                            >
                                                <div className={cn("rounded-full p-2.5", isSelected ? "bg-[#6BA898] text-white" : "bg-[#F2F4F7] text-[#667085]")}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <span className={cn("text-sm font-medium", isSelected ? "text-[#1B5E20]" : "text-[#344054]")}>{category.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-lg font-bold font-display text-[#101828]">Select Local Government</h2>
                                <select {...register("lga")} className="h-12 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 text-sm text-[#101828] focus:border-[#6BA898] focus:ring-1 focus:ring-[#6BA898]">
                                    <option value="">Select LGA</option>
                                    {lgas.map((lga: any, index: number) => {
                                        const lgaName = typeof lga === 'string' ? lga : lga.name;
                                        const lgaKey = typeof lga === 'string' ? lga : (lga._id || lga.id || `lga-${index}`);
                                        return (
                                            <option key={lgaKey} value={lgaName}>
                                                {lgaName}
                                            </option>
                                        );
                                    })}
                                </select>
                                {errors.lga && <p className="text-sm text-red-600">{errors.lga.message}</p>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="button" onClick={handleNext} className="bg-[#6BA898] hover:bg-[#5a9182] text-white px-8 h-12 rounded-xl text-base font-medium">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: PHOTO & LOCATION */}
                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#101828]">Add a Photo</h2>
                                    <p className="text-sm text-[#475467]">A photo helps authorities understand the issue better</p>
                                </div>

                                <div className="border-[2px] border-dashed border-[#E0E0E0] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 bg-[#FCFCFD]">
                                    {previewUrl ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            <Button type="button" variant="secondary" size="sm" className="absolute right-2 top-2 h-8 w-8 rounded-full p-0 bg-white/80 hover:bg-white" onClick={() => { setPreviewUrl(null); setValue("image", undefined); }}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-14 w-14 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#667085]">
                                                    <ImageIcon className="h-7 w-7" />
                                                </div>
                                                <p className="text-sm text-[#475467] font-medium">Add a photo of the issue</p>
                                            </div>
                                            <div className="flex gap-4 w-full justify-center max-w-sm">
                                                <label className="flex-1 cursor-pointer group">
                                                    <input type="file" accept="image/*" className="hidden" capture="environment" onChange={handleImageUpload} />
                                                    <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#344054] shadow-xs transition-colors hover:bg-[#F9FAFB] group-active:translate-y-0.5">
                                                        <Camera className="h-4 w-4" /> Camera
                                                    </div>
                                                </label>
                                                <label className="flex-1 cursor-pointer group">
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                    <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 text-sm font-semibold text-[#344054] shadow-xs transition-colors hover:bg-[#F9FAFB] group-active:translate-y-0.5">
                                                        <UploadCloud className="h-4 w-4" /> Gallery
                                                    </div>
                                                </label>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#101828]">Location</h2>
                                    <p className="text-sm text-[#475467]">Where is this issue located?</p>
                                </div>

                                <div className="rounded-xl border border-[#FEDF89] bg-[#FFFAEB] p-4 flex items-center gap-3 text-[#B54708]">
                                    <div className="h-5 w-5 rounded-full border-[1.5px] border-[#B54708] flex items-center justify-center text-[10px] font-bold shrink-0">!</div>
                                    <span className="text-sm font-medium">Could not detect location</span>
                                </div>

                                <div className="flex gap-2">
                                    <Input placeholder="Enter location manually (e.g., Bodija Market)" {...register("location")} className="h-12 border-[#D0D5DD] text-[#101828] placeholder:text-[#667085]" />
                                    <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0 rounded-xl border-[#D0D5DD] text-[#344054]" onClick={handleLocationClick} disabled={isLocating}>
                                        {isLocating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#344054] border-t-transparent" /> : <Navigation className="h-5 w-5" />}
                                    </Button>
                                </div>
                                {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-12 border-transparent text-[#475467] hover:text-[#101828]">Back</Button>
                                <Button type="button" onClick={handleNext} className="bg-[#6BA898] hover:bg-[#5a9182] text-white px-8 h-12 rounded-xl text-base font-medium min-w-[150px]">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#101828]">Brief Title</h2>
                                    <p className="text-sm text-[#475467]">Give your report a short title</p>
                                </div>
                                <Input placeholder="e.g., Large pothole on main road" {...register("title")} className="h-12 border-[#D0D5DD] text-[#101828] placeholder:text-[#667085]" />
                                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold font-display text-[#101828]">Description</h2>
                                    <p className="text-sm text-[#475467]">Provide more details (optional)</p>
                                </div>
                                <textarea {...register("description")} className="min-h-[160px] w-full rounded-xl border border-[#D0D5DD] bg-white px-3 py-3 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-[#6BA898] focus:border-[#6BA898]" placeholder="Provide more details..." />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="outline" onClick={handleBack} className="h-12 min-w-[100px] rounded-xl border-[#D0D5DD] text-[#344054] font-medium">Back</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-[#1B5E20] hover:bg-[#144517] text-white px-6 h-12 rounded-xl text-base font-medium min-w-[180px] gap-2">
                                    {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Send className="h-4 w-4" /> Submit Report</>}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </div>
    );
}
