"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, Eye, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

export default function ResolvedReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [filteredReports, setFilteredReports] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
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
            // Filter only resolved reports
            const resolved = data.filter((r: any) => r.status === "resolved");
            setReports(resolved);
            setFilteredReports(resolved);

            // Fetch LGAs
            const states = await adminApi.getStates();
            const oyoState = states.find((s: any) => s.name.toLowerCase().includes("oyo"));
            if (oyoState) {
                const lgaData = await adminApi.getLgas(oyoState.id || oyoState._id);
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

        // Search filter
        if (searchQuery) {
            result = result.filter((report) =>
                report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            result = result.filter((report) => report.category === categoryFilter);
        }

        // LGA filter
        if (lgaFilter !== "all") {
            result = result.filter((report) => (report.lga || report.location || "").toLowerCase().includes(lgaFilter.toLowerCase()));
        }

        setFilteredReports(result);
    }, [searchQuery, categoryFilter, lgaFilter, reports]);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "resolved": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: any = {
            road: "bg-blue-100 text-blue-800",
            drainage: "bg-cyan-100 text-cyan-800",
            waste: "bg-amber-100 text-amber-800",
            electricity: "bg-yellow-100 text-yellow-800",
            water: "bg-sky-100 text-sky-800",
            security: "bg-red-100 text-red-800",
        };
        return colors[category?.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[#101828]">Resolved Reports</h1>
                <p className="text-[#475467] mt-1">View all successfully resolved community reports</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <CardTitle>All Resolved Reports ({filteredReports.length})</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full sm:w-[300px]"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="road">Road</SelectItem>
                                    <SelectItem value="drainage">Drainage</SelectItem>
                                    <SelectItem value="waste">Waste</SelectItem>
                                    <SelectItem value="electricity">Electricity</SelectItem>
                                    <SelectItem value="water">Water</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={lgaFilter} onValueChange={setLgaFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
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
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No resolved reports found</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>LGA</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReports.map((report) => (
                                    <TableRow key={report._id || report.id}>
                                        <TableCell className="font-medium">{report.title || report.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getCategoryColor(report.category)}>
                                                {report.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {report.address_text || report.community_name || report.location || "N/A"}
                                        </TableCell>
                                        <TableCell>{report.lga || report.location || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(report.status)}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(report.createdAt || report.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.open(`/reports/${report._id || report.id}`, '_blank')}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(report._id || report.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
