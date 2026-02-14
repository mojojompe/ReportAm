"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Search, PlayCircle, CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [lgaFilter, setLgaFilter] = useState("all");
    const [lgas, setLgas] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getReports();
            // adminApi.getReports() now returns a clean array
            // Filter out resolved reports (show only active)
            const active = data.filter((r: any) => r.status !== "resolved");
            setReports(active);
            setFilteredReports(active);

            // Fetch LGAs
            const states = await adminApi.getStates();
            const oyoState = states.find((s: any) => s.name.toLowerCase().includes("oyo"));
            if (oyoState) {
                const lgaData = await adminApi.getLgas(oyoState.id || oyoState._id);
                // Handle if LGA data is array of strings or objects
                const lgaNames = lgaData.map((l: any) => typeof l === 'string' ? l : l.name);
                setLgas(lgaNames.sort());
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = reports;

        if (statusFilter !== "all") {
            result = result.filter(r => r.status === statusFilter);
        }

        if (lgaFilter !== "all") {
            result = result.filter(r => (r.lga || r.location || "").toLowerCase().includes(lgaFilter.toLowerCase()));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title?.toLowerCase().includes(query) ||
                r.location?.toLowerCase().includes(query) ||
                r.category?.toLowerCase().includes(query)
            );
        }

        setFilteredReports(result);
    }, [searchQuery, statusFilter, lgaFilter, reports]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await adminApi.updateStatus(id, newStatus);
            setReports(prev => prev.map(r => (r._id || r.id) === id ? { ...r, status: newStatus } : r));
            toast.success(`Report marked as ${newStatus}`);

            // Refresh if marked as resolved (remove from active list)
            if (newStatus === "resolved") {
                fetchReports();
            }
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;

        try {
            await adminApi.deleteReport(id);
            toast.success("Report deleted successfully");
            fetchReports();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete report");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display text-[#101828]">Active Reports</h1>
                    <p className="text-muted-foreground">Manage pending and in-progress community reports</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reports..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={lgaFilter} onValueChange={setLgaFilter}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Filter by LGA" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All LGAs</SelectItem>
                        {lgas.map(lga => (
                            <SelectItem key={lga} value={lga}>{lga}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-white border-none shadow-sm">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-[#F9FAFB]">
                                <TableRow>
                                    <TableHead className="w-[80px]">Photo</TableHead>
                                    <TableHead>Report</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.map((report) => (
                                    <TableRow key={report._id || report.id}>
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden">
                                                {(report.image || report.imageUrl) ? (
                                                    <img
                                                        src={(report.image || report.imageUrl)?.startsWith("http")
                                                            ? (report.image || report.imageUrl)
                                                            : `https://reportam-backend-sun4.onrender.com${(report.image || report.imageUrl)?.startsWith('/') ? '' : '/'}${report.image || report.imageUrl}`}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).parentElement!.innerText = 'Err';
                                                            (e.target as HTMLImageElement).parentElement!.className = "h-full w-full flex items-center justify-center text-xs text-gray-400";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-[#101828]">{report.title || report.description}</div>
                                            <div className="text-sm text-muted-foreground capitalize">{report.category}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                            {report.address_text || report.community_name || report.location || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(report.createdAt || report.timestamp).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline"
                                                className={
                                                    report.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-orange-50 text-orange-700 border-orange-200'
                                                }
                                            >
                                                {report.status || "pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleStatusUpdate(report._id || report.id, 'in-progress')}
                                                            >
                                                                <PlayCircle className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Mark In Progress</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleStatusUpdate(report._id || report.id, 'resolved')}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Mark Resolved</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(report._id || report.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Report</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredReports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No reports found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
