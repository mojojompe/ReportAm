"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MapPin } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function LgaStatsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLga, setSelectedLga] = useState<string>("All");
    const [stats, setStats] = useState<any>({});
    const [lgas, setLgas] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await adminApi.getReports();
                setReports(data || []);

                // Extract Unique LGAs
                const uniqueLgas = Array.from(new Set(data.map((r: any) => r.lga || r.address_text?.split(',')[1]?.trim() || "Unknown"))).filter(Boolean);
                setLgas(uniqueLgas as string[]);

                // Calculate Stats
                calculateStats(data, "All");
            } catch (error) {
                console.error("Failed to load reports for stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const calculateStats = (data: any[], lgaRequest: string) => {
        const filtered = lgaRequest === "All"
            ? data
            : data.filter((r: any) => (r.lga === lgaRequest) || (r.address_text?.includes(lgaRequest)));

        // Group by Category
        const categoryCounts: Record<string, number> = {};
        filtered.forEach((r: any) => {
            const cat = r.category || "Uncategorized";
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        setStats({
            total: filtered.length,
            breakdown: categoryCounts
        });
    };

    const handleLgaChange = (value: string) => {
        setSelectedLga(value);
        calculateStats(reports, value);
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-display text-[#101828]">LGA Statistics</h1>
                    <p className="text-muted-foreground">Breakdown of reports by Local Government Area</p>
                </div>
                <div className="w-64">
                    <Select value={selectedLga} onValueChange={handleLgaChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select LGA" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All LGAs</SelectItem>
                            {lgas.map((lga) => (
                                <SelectItem key={lga} value={lga}>
                                    {lga}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Total Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold mb-1">{loading ? "..." : stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            in {selectedLga === "All" ? "all regions" : selectedLga}
                        </p>
                    </CardContent>
                </Card>

                {/* Breakdown Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div>Loading stats...</div>
                        ) : Object.keys(stats.breakdown || {}).length === 0 ? (
                            <div className="text-muted-foreground">No data available for this selection.</div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(stats.breakdown).map(([category, count]) => (
                                    <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                                        <span className="font-medium text-sm text-slate-700 capitalize">{category}</span>
                                        <Badge variant="secondary" className="text-slate-600 bg-white border shadow-sm">
                                            {count as number}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
