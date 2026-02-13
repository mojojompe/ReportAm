"use client";

import { useEffect, useState } from "react";
import { FeedItem } from "./ui/FeedItem";
import { reportApi } from "@/lib/api";
import {
    Loader2, Construction, Droplets, Trash2,
    Zap, Droplet, Shield, Heart, MoreHorizontal
} from "lucide-react";
import { Location01Icon, DashboardSquare01Icon, Search01Icon } from "hugeicons-react";
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
    const [selectedLga, setSelectedLga] = useState("All Regions");
    const [lgas, setLgas] = useState<string[]>(["All Regions"]);

    const FILTERS = [
        { label: "All", icon: DashboardSquare01Icon, isHugeIcon: true },
        { label: "Road", icon: Construction, isHugeIcon: false },
        { label: "Drainage", icon: Droplets, isHugeIcon: false },
        { label: "Waste", icon: Trash2, isHugeIcon: false },
        { label: "Electricity", icon: Zap, isHugeIcon: false },
        { label: "Water", icon: Droplet, isHugeIcon: false },
        { label: "Security", icon: Shield, isHugeIcon: false },
        { label: "Health", icon: Heart, isHugeIcon: false },
        { label: "Other", icon: MoreHorizontal, isHugeIcon: false },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch Reports
                const reportsData = await reportApi.getReports();
                console.log("Raw API response:", reportsData);
                const reportsArray = reportsData.reports || (Array.isArray(reportsData) ? reportsData : (reportsData.data || []));

                const mappedReports = reportsArray.map((report: any) => ({
                    ...report,
                    id: report._id || report.id,
                    title: report.description?.substring(0, 50) || report.title,
                    description: report.description,
                    location: report.address_text || report.community_name,
                    imageUrl: report.image,
                    timestamp: report.timestamp || report.created_at || report.createdAt || new Date().toISOString(),
                }));
                setReports(mappedReports);

                // Fetch LGAs for Oyo State
                const states = await reportApi.getStates();
                const oyoState = states.find((s: any) => s.name.toLowerCase().includes("oyo"));

                if (oyoState) {
                    const lgaData = await reportApi.getLgas(oyoState.id || oyoState._id);
                    // Handle if LGA data is array of strings or objects
                    const lgaNames = lgaData.map((l: any) => typeof l === 'string' ? l : l.name);
                    setLgas(["All Regions", ...lgaNames]);
                }

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load data. Using offline data.");
                setReports(MOCK_REPORTS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredReports = reports.filter(r => {
        const matchesFilter = activeFilter === "All" || (r.category || "").toLowerCase() === activeFilter.toLowerCase();
        const matchesSearch = (r.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (r.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (r.location?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const matchesLga = selectedLga === "All Regions" || (r.location?.toLowerCase() || "").includes(selectedLga.toLowerCase());
        return matchesFilter && matchesSearch && matchesLga;
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#6BA898]" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 pt-6 px-4 sm:px-0">
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search01Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
                    <input
                        type="text"
                        placeholder="Search reports by location, keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] text-base outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-all placeholder:text-[#98A2B3]"
                    />
                </div>

                {/* LGA Selector */}
                <div className="relative">
                    <Location01Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
                    <select
                        value={selectedLga}
                        onChange={(e) => setSelectedLga(e.target.value)}
                        className="w-full h-12 pl-12 pr-10 rounded-xl border border-[#EAECF0] bg-white text-base outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-all appearance-none cursor-pointer text-[#101828]"
                    >
                        {lgas.map(lga => (
                            <option key={lga} value={lga}>{lga}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#667085" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {FILTERS.map((filter) => {
                        const Icon = filter.icon;
                        const isActive = activeFilter === filter.label;
                        return (
                            <button
                                key={filter.label}
                                onClick={() => setActiveFilter(filter.label)}
                                className={`
                                    whitespace-nowrap flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all border
                                    ${isActive
                                        ? "bg-[#047857] text-white border-[#047857] shadow-sm"
                                        : "bg-white text-[#344054] border-[#EAECF0] hover:bg-[#F9FAFB] hover:text-[#101828] hover:border-[#D0D5DD]"}
                                `}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-8 mt-6">
                {filteredReports.map((report) => (
                    <FeedItem key={report.id} report={report} />
                ))}
                {filteredReports.length === 0 && (
                    <div className="text-center py-16 text-[#667085]">
                        <div className="flex justify-center mb-4">
                            <Search01Icon className="h-12 w-12 text-[#EAECF0]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#101828]">No reports found</h3>
                        <p className="text-[#64748B]">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
