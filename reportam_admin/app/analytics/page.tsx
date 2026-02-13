"use client";

import { useEffect, useState } from "react";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [timelineData, setTimelineData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await adminApi.getReports();
                // adminApi.getReports() now returns a clean array
                setReports(data);

                // Process Category Data
                const catMap: Record<string, number> = {};
                data.forEach((r: any) => {
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
                data.forEach((r: any) => {
                    // Use createdAt field (backend standard)
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
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold font-display text-[#101828]">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Insights into community reporting trends</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    Loading analytics data...
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Reports Over Time</CardTitle>
                            <CardDescription>Monthly reporting volume for the last 6 months</CardDescription>
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
                            <CardDescription>Distribution of improved issues</CardDescription>
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
                                            <span>{entry.name}</span>
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
