"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Clock, ThumbsUp } from "lucide-react";
import { Location01Icon, UserGroup02Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { reportApi } from "@/lib/api";
import html2canvas from "html2canvas";

interface Comment {
    id: string;
    user: string;
    text: string;
    likes: number;
    replies: Comment[];
    timestamp: string;
}

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
        pending: { bg: "bg-orange-50", text: "text-orange-700", label: "Pending" },
    };

    const statusObj = statusConfig[report.status] || statusConfig.pending;

    const [isAffected, setIsAffected] = useState(false);
    const [affectedCount, setAffectedCount] = useState(report.affected_count || 0);
    const [isSharing, setIsSharing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Load comments when section is opened
    useEffect(() => {
        if (showComments && comments.length === 0) {
            loadComments();
        }
    }, [showComments]);

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const data = await reportApi.getComments(report.id);
            const processed = processComments(data);
            setComments(processed);
        } catch (error) {
            console.error("Failed to load comments", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const processComments = (apiComments: any[]): Comment[] => {
        if (!Array.isArray(apiComments)) return [];

        const commentMap = new Map<string, Comment>();
        const roots: Comment[] = [];

        // First pass: Create objects
        apiComments.forEach(c => {
            commentMap.set(c._id, {
                id: c._id,
                user: c.username || "Anonymous",
                text: c.text,
                likes: Array.isArray(c.likes) ? c.likes.length : (c.likes || 0),
                replies: [],
                timestamp: c.createdAt || c.timestamp
            });
        });

        // Second pass: Structure tree
        apiComments.forEach(c => {
            const comment = commentMap.get(c._id);
            if (!comment) return;

            if (c.parentId && commentMap.has(c.parentId)) {
                commentMap.get(c.parentId)!.replies.push(comment);
            } else {
                roots.push(comment);
            }
        });

        return roots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const handleAffectedClick = async () => {
        const newIsAffected = !isAffected;
        const newCount = isAffected ? affectedCount - 1 : affectedCount + 1;
        setIsAffected(newIsAffected);
        setAffectedCount(newCount);
        try {
            if (newIsAffected) await reportApi.markAffected(report.id);
            else await reportApi.unmarkAffected(report.id);
            toast.success(newIsAffected ? "Marked as affected" : "Removed affected mark");
        } catch (error) {
            setIsAffected(!newIsAffected);
            setAffectedCount(affectedCount);
            toast.error("Failed to update status");
        }
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                allowTaint: true,
                ignoreElements: (element) => element.tagName === 'IFRAME',
            });
            const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
            const shareText = `Check out this report on ReportAm:\n${report.title}\n${report.description}\n\nView more at: https://reportam.vercel.app/`;

            if (navigator.share && navigator.canShare) {
                const file = new File([blob], `report-${report.id}.png`, { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({ title: report.title, text: shareText, files: [file] });
                } else {
                    await navigator.share({ title: report.title, text: shareText });
                }
                toast.success("Shared successfully!");
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `report-${report.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                try {
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Image downloaded and share text copied!");
                } catch {
                    toast.success("Image downloaded successfully!");
                }
            }
        } catch (error) {
            console.error("Share error:", error);
            const shareText = `Check out this report on ReportAm:\n${report.title}\n${report.description}\n\nView more at: https://reportam.vercel.app/`;
            if (navigator.share) {
                try {
                    await navigator.share({ text: shareText, title: report.title });
                    toast.success("Shared text successfully");
                    return;
                } catch (e) { }
            }
            toast.error("Failed to share image.");
        } finally {
            setIsSharing(false);
        }
    };

    const getTimeString = (timestamp: string) => {
        if (!timestamp) return "Recently";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "Recently";
        const diff = new Date().getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const handlePostComment = async (parentId: string | null = null) => {
        if (!newComment.trim()) return;

        try {
            await reportApi.createComment(report.id, {
                text: newComment,
                parentId: parentId || undefined,
                username: "Anonymous User" // In a real app, get from auth context
            });

            setNewComment("");
            setReplyingTo(null);
            loadComments(); // Reload to see new comment
            toast.success("Comment posted!");
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    const handleLikeComment = async (commentId: string, parentId?: string) => {
        // Optimistic update
        const updateLikes = (list: Comment[]): Comment[] => {
            return list.map(c => {
                if (c.id === commentId) return { ...c, likes: c.likes + 1 }; // Simple toggle simulation
                if (c.replies.length > 0) return { ...c, replies: updateLikes(c.replies) };
                return c;
            });
        };
        setComments(updateLikes(comments));

        try {
            await reportApi.likeComment(commentId);
            // Optionally reload to sync exact state
        } catch (error) {
            toast.error("Failed to like comment");
            loadComments(); // Revert on error
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
        >
            <Card ref={cardRef} className="overflow-hidden border border-[#EAECF0] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl sm:rounded-3xl">
                {/* Image - Full Width, No Padding */}
                {report.imageUrl && (
                    <div>
                        <div className="relative aspect-video w-full bg-[#F2F4F7]">
                            <img
                                src={report.imageUrl.startsWith("http") ? report.imageUrl : `https://reportam-backend-sun4.onrender.com${report.imageUrl}`}
                                alt={report.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className="p-4 sm:p-5 space-y-4">
                    {/* Badges and Time */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {report.category && (
                                <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold">
                                    {report.category}
                                </span>
                            )}
                            <span className={`${statusObj.bg} ${statusObj.text} px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                <Clock className="h-3 w-3" />
                                {statusObj.label}
                            </span>
                        </div>
                        <span className="text-xs sm:text-sm text-[#667085]">
                            {getTimeString(report.timestamp)}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-bold text-[#101828] font-display leading-tight">{report.title}</h3>
                        <p className="text-sm sm:text-base text-[#475467] leading-relaxed">
                            {report.description}
                        </p>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-[#475467]">
                        <Location01Icon className="h-5 w-5 text-[#047857]" />
                        <span className="text-sm font-medium">{report.location}</span>
                    </div>

                    <hr className="border-[#EAECF0]" />

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            onClick={handleAffectedClick}
                            className={`w-full h-12 rounded-xl font-semibold text-base transition-all active:scale-95 border ${isAffected
                                ? "bg-[#F0FDF9] text-[#0D9488] border-[#0D9488]"
                                : "bg-white text-[#344054] border-[#D0D5DD] hover:bg-[#F9FAFB]"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2 w-full">
                                <UserGroup02Icon className="h-6 w-6" />
                                <span>I am affected</span>
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${isAffected ? "bg-[#CCFBF1] text-[#0F766E]" : "bg-[#F2F4F7] text-[#344054]"
                                    }`}>
                                    {affectedCount}
                                </span>
                            </span>
                        </Button>

                        {/* Comments and Share Buttons Row */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-10 rounded-lg border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828]"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                {comments.length > 0 ? comments.length : report.comments} Comments
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-10 rounded-lg border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828]"
                                onClick={handleShare}
                                disabled={isSharing}
                            >
                                {isSharing ? (
                                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-[#667085] border-t-transparent" />
                                ) : (
                                    <Share2 className="h-4 w-4 mr-2" />
                                )}
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-[#EAECF0] pt-4"
                            >
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            maxLength={50}
                                            placeholder={replyingTo ? "Replying..." : "Add a comment (max 50 chars)..."}
                                            className="flex-1 h-10 rounded-lg border border-[#EAECF0] px-3 text-sm focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]"
                                        />
                                        <Button size="sm" onClick={() => handlePostComment(replyingTo)} disabled={!newComment.trim()}>
                                            Post
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {comments.length === 0 && <p className="text-sm text-[#98A2B3] text-center py-2">No comments yet. Be the first to analyze!</p>}
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-[#F9FAFB] p-3 rounded-lg space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold text-sm text-[#101828]">{comment.user}</span>
                                                    <span className="text-xs text-[#98A2B3]">{getTimeString(comment.timestamp)}</span>
                                                </div>
                                                <p className="text-sm text-[#475467]">{comment.text}</p>
                                                <div className="flex gap-4 pt-1">
                                                    <button onClick={() => handleLikeComment(comment.id)} className="text-xs text-[#667085] hover:text-[#047857] flex items-center gap-1 font-medium transition-colors">
                                                        <ThumbsUp className="h-3 w-3" /> {comment.likes} Likes
                                                    </button>
                                                    <button onClick={() => { setReplyingTo(comment.id); setNewComment(`@${comment.user} `); }} className="text-xs text-[#667085] hover:text-[#047857] font-medium transition-colors">
                                                        Reply
                                                    </button>
                                                </div>
                                                {/* Replies */}
                                                {comment.replies.length > 0 && (
                                                    <div className="pl-4 mt-2 space-y-2 border-l-2 border-[#EAECF0]">
                                                        {comment.replies.map((reply) => (
                                                            <div key={reply.id} className="space-y-1">
                                                                <div className="flex justify-between items-start">
                                                                    <span className="font-semibold text-xs text-[#101828]">{reply.user}</span>
                                                                    <span className="text-[10px] text-[#98A2B3]">{getTimeString(reply.timestamp)}</span>
                                                                </div>
                                                                <p className="text-xs text-[#475467]">{reply.text}</p>
                                                                <button onClick={() => handleLikeComment(reply.id, comment.id)} className="text-[10px] text-[#667085] hover:text-[#047857] flex items-center gap-1 mt-1 transition-colors">
                                                                    <ThumbsUp className="h-2.5 w-2.5" /> {reply.likes}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </motion.div>
    );
}
