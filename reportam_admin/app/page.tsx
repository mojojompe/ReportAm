"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, pending: 0, resolved: 0, critical: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, reportsData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getReports()
        ]);

        setStats(statsData);

        // adminApi.getReports() now returns a clean array
        console.log("Admin reports data:", reportsData);
        console.log("Admin reports list length:", reportsData.length);

        const sorted = reportsData.sort((a: any, b: any) =>
          new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime()
        );
        setReports(sorted.slice(0, 5));
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#101828]">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor community reports and resolution status</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.total}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pending}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Successfully closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.critical}</div>
            <p className="text-xs text-muted-foreground">SOS Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reports yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id || report.id}>
                    <TableCell className="font-medium">{report.title || report.description}</TableCell>
                    <TableCell className="capitalize">{report.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{report.address_text || report.community_name || report.location || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}
                        className={
                          report.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            report.status === 'in-progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                              'bg-orange-100 text-orange-700 hover:bg-orange-100'
                        }
                      >
                        {report.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(report.createdAt || report.timestamp).toLocaleDateString()}</TableCell>
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
