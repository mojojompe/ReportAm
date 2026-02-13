"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Trash2, Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CommentsPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getComments();
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load comments:", error);
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this comment? This action cannot be undone.")) return;

        try {
            await adminApi.deleteComment(id);
            toast.success("Comment deleted successfully");
            // Optimistic update or reload
            setComments(comments.filter((c) => c._id !== id && c.id !== id));
        } catch (error) {
            // toast.error("Failed to delete comment"); // API might fail if backend not ready, suppress for now or keep
            toast.error("Failed to delete comment");
        }
    };

    const filteredComments = comments.filter((comment) =>
        (comment.text?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (comment.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (comment.reportTitle?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display text-[#101828]">Comments Management</h1>
                    <p className="text-muted-foreground">Monitor and moderate user comments</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        All Comments
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search comments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredComments.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 flex flex-col items-center">
                            <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                            <p>No comments found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Comment</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Report Context</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredComments.map((comment) => (
                                    <TableRow key={comment._id || comment.id}>
                                        <TableCell>
                                            <p className="max-w-md truncate font-medium text-[#101828]">{comment.text}</p>
                                        </TableCell>
                                        <TableCell>{comment.username || "Anonymous"}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                            {comment.reportTitle || "Report #" + (comment.reportId?.substring(0, 6) || "???")}
                                        </TableCell>
                                        <TableCell>{new Date(comment.createdAt || comment.timestamp).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(comment._id || comment.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
