"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ThumbsUp, MessageSquare, Share2, Clock, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { reportApi } from "@/lib/api";

interface Report {
    id: string;
    title: string;
    description: string;
    location: string;
    imageUrl?: string;
    status: "pending" | "in-progress" | "resolved";
    likes: number;
    comments: number;
    timestamp: string;
    category?: string;
    affected_count?: number;
}

interface FeedItemProps {
    report: Report;
}

export function FeedItem({ report }: FeedItemProps) {
    const statusConfig = {
        resolved: { bg: "bg-green-50", text: "text-green-700", label: "Resolved" },
        "in-progress": { bg: "bg-yellow-50", text: "text-yellow-700", label: "In Progress" },
        pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
    };

    const statusObj = statusConfig[report.status] || statusConfig.pending;

    const [isAffected, setIsAffected] = useState(false);
    const [affectedCount, setAffectedCount] = useState(report.affected_count || 0);

    const handleAffectedClick = async () => {
        // Optimistic update
        const newIsAffected = !isAffected;
        const newCount = isAffected ? affectedCount - 1 : affectedCount + 1;

        setIsAffected(newIsAffected);
        setAffectedCount(newCount);

        try {
            if (newIsAffected) {
                // User marked as affected
                await reportApi.markAffected(report.id); // API method to be added
            } else {
                // User removed mark
                await reportApi.unmarkAffected(report.id); // API method to be added
            }
            toast.success(newIsAffected ? "Marked as affected" : "Removed affected mark");
        } catch (error) {
            // Revert on error
            setIsAffected(!newIsAffected);
            setAffectedCount(affectedCount);
            toast.error("Failed to update status");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border border-[#EAECF0] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl">
                {/* Header */}
                <div className="flex items-start justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] flex items-center justify-center text-[#0D9488] font-bold text-lg border border-[#E0F2F1]">
                            {report.title.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[15px] leading-tight text-[#101828] font-display">{report.title}</h3>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#667085] mt-1">
                                <span className={`${statusObj.bg} ${statusObj.text} px-2 py-0.5 rounded-full font-medium`}>
                                    {statusObj.label}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(report.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#98A2B3] hover:text-[#101828] hover:bg-[#F2F4F7]">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="px-4 pb-3 space-y-2">
                    <p className="text-sm text-[#475467] leading-relaxed line-clamp-2">
                        {report.description}
                    </p>
                    {report.category && (
                        <div className="inline-flex items-center rounded-full bg-[#F2F4F7] px-2.5 py-0.5 text-xs font-medium text-[#344054]">
                            #{report.category}
                        </div>
                    )}
                </div>

                {/* Image - Full Width */}
                {report.imageUrl && (
                    <div className="relative aspect-video w-full bg-[#F2F4F7]">
                        <img
                            src={report.imageUrl.startsWith("http") ? report.imageUrl : `https://reportam-backend-sun4.onrender.com${report.imageUrl}`}
                            alt={report.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                {/* Location Bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 bg-[#FCFCFD] border-t border-[#F2F4F7]">
                    <MapPin className="h-3.5 w-3.5 text-[#98A2B3]" />
                    <span className="text-xs font-medium text-[#667085] truncate">{report.location}</span>
                </div>

                {/* Footer Actions */}
                <div className="px-4 pb-4 pt-2">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAffectedClick}
                            className={`flex-1 gap-2 rounded-lg font-semibold h-10 transition-all active:scale-95 ${isAffected
                                ? "bg-[#F0FDF9] text-[#0D9488] border-[#0D9488]"
                                : "border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828] hover:border-[#D0D5DD]"
                                }`}
                        >
                            <span className="text-xl">✋</span>
                            <span className="text-sm">I am affected</span>
                            <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full ${isAffected ? "bg-[#CCFBF1] text-[#0F766E]" : "bg-[#F2F4F7] text-[#667085]"
                                }`}>
                                {affectedCount || 0}
                            </span>
                        </Button>

                        <div className="flex gap-2 ml-3">
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg border border-transparent hover:border-[#EAECF0]">
                                <MessageSquare className="h-5 w-5" />
                                <span className="sr-only">Comment</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-[#667085] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg border border-transparent hover:border-[#EAECF0]">
                                <Share2 className="h-5 w-5" />
                                <span className="sr-only">Share</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
