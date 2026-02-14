"use client";

import { useEffect, useState, use } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { startOfMonth, format, subMonths } from "date-fns";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function LgaAnalyticsPage({ params }: { params: Promise<{ lga: string }> }) {
    const router = useRouter();
    const [unwrappedParams, setUnwrappedParams] = useState<{ lga: string } | null>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [timelineData, setTimelineData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lgaName, setLgaName] = useState("");

    useEffect(() => {
        params.then(setUnwrappedParams);
    }, [params]);

    useEffect(() => {
        if (!unwrappedParams) return;

        const decodedLga = decodeURIComponent(unwrappedParams.lga);
        setLgaName(decodedLga);

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await adminApi.getReports();

                // Filter by LGA
                const lgaReports = data.filter((r: any) =>
                    (r.lga || r.location || "").toLowerCase().includes(decodedLga.toLowerCase())
                );

                setReports(lgaReports);

                // Process Category Data
                const catMap: Record<string, number> = {};
                lgaReports.forEach((r: any) => {
                    const cat = r.category || 'Other';
                    catMap[cat] = (catMap[cat] || 0) + 1;
                });
                setCategoryData(Object.keys(catMap).map(name => ({ name, value: catMap[name] })));

                // Process Timeline Data (Last 6 months)
                const timelineMap: Record<string, number> = {};
                for (let i = 5; i >= 0; i--) {
                    const date = subMonths(new Date(), i);
                    const key = format(date, 'MMM yyyy');
                    timelineMap[key] = 0;
                }
                lgaReports.forEach((r: any) => {
                    const date = new Date(r.createdAt || r.timestamp);
                    const key = format(date, 'MMM yyyy');
                    if (timelineMap[key] !== undefined) {
                        timelineMap[key]++;
                    }
                });
                setTimelineData(Object.keys(timelineMap).map(month => ({ month, reports: timelineMap[month] })));
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [unwrappedParams]);

    if (!unwrappedParams) return null;

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-display text-[#101828]">Analytics: {lgaName}</h1>
                    <p className="text-muted-foreground">Detailed reports for {lgaName}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    Loading analytics data...
                </div>
            ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>No reports found for this LGA.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Reports Over Time</CardTitle>
                            <CardDescription>Monthly reporting volume for {lgaName}</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="reports" fill="#1B5E20" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Reports by Category</CardTitle>
                            <CardDescription>Distribution of issues in {lgaName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {categoryData.map((entry, index) => (
                                        <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span>{entry.name} ({entry.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
