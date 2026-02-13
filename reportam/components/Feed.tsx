"use client";

import { useEffect, useState } from "react";
import { FeedItem } from "./ui/FeedItem";
import { reportApi } from "@/lib/api";
import {
    Loader2, Search, Construction, Droplets, Trash2,
    Zap, Droplet, Shield, Heart, MoreHorizontal
} from "lucide-react";
import { toast } from 'sonner'

// Mock data for initial render/fallback
const MOCK_REPORTS = [
    {
        id: "1",
        title: "Broken Street Light",
        description: "The street light at the corner of 5th Avenue and Main Street has been out for a week. It's very dark and dangerous at night.",
        location: "Lagos, Nigeria",
        imageUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f525a3c?q=80&w=800&auto=format&fit=crop", // Lagos Street text
        status: "pending" as const,
        likes: 12,
        comments: 3,
        timestamp: new Date().toISOString(),
        category: "Electricity"
    },
    {
        id: "2",
        title: "Pothole on Highway",
        description: "Huge pothole causing traffic buildup near the bridge. Several cars have been damaged.",
        location: "Abuja, FCT",
        status: "in-progress" as const,
        likes: 45,
        comments: 12,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        category: "Road"
    },
    {
        id: "3",
        title: "Illegal Dumping",
        description: "Construction waste being dumped in the local park. This needs immediate attention from environmental services.",
        location: "Port Harcourt",
        imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop", // Waste/Environment
        status: "resolved" as const,
        likes: 89,
        comments: 24,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        category: "Waste"
    },
];

export function Feed() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const FILTERS = [
        { label: "All", icon: null },
        { label: "Road", icon: Construction },
        { label: "Drainage", icon: Droplets },
        { label: "Waste", icon: Trash2 },
        { label: "Electricity", icon: Zap },
        { label: "Water", icon: Droplet },
        { label: "Security", icon: Shield },
        { label: "Health", icon: Heart },
        { label: "Other", icon: MoreHorizontal },
    ];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                const data = await reportApi.getReports();
                console.log("Raw API response:", data);

                // Backend returns { reports: [...] } with pagination
                const reportsArray = data.reports || (Array.isArray(data) ? data : (data.data || []));
                console.log("Reports array length:", reportsArray.length);

                // Map backend fields to frontend format
                const mappedReports = reportsArray.map((report: any) => ({
                    ...report,
                    id: report._id || report.id, // Backend uses _id
                    title: report.description, // Use description as title
                    location: report.address_text || report.community_name,
                    imageUrl: report.image,
                }));

                setReports(mappedReports);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                toast.error("Failed to load reports. Using offline data.");
                setReports(MOCK_REPORTS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(r => {
        const matchesFilter = activeFilter === "All" || (r.category || "").toLowerCase() === activeFilter.toLowerCase();
        const matchesSearch = (r.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (r.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (r.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6BA898]" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#EAECF0] bg-white text-sm outline-none focus:border-[#6BA898] focus:ring-1 focus:ring-[#6BA898] transition-all"
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.label}
                                onClick={() => setActiveFilter(filter.label)}
                                className={`
                                    whitespace-nowrap flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all border
                                    ${activeFilter === filter.label
                                        ? "bg-[#047857] text-white border-[#047857] shadow-sm"
                                        : "bg-white text-[#475467] border-[#E0E0E0] hover:bg-[#F9FAFB] hover:text-[#101828]"}
                                `}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                {filteredReports.map((report) => (
                    <FeedItem key={report.id} report={report} />
                ))}
                {filteredReports.length === 0 && (
                    <div className="text-center py-12 text-[#667085]">
                        <p>No reports found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
