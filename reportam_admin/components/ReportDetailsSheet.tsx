import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface ReportDetailsSheetProps {
    report: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportDetailsSheet({ report, open, onOpenChange }: ReportDetailsSheetProps) {
    if (!report) return null;

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "resolved": return "bg-green-100 text-green-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "progress": return "bg-blue-100 text-blue-800";
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

    const imageUrl = report.image || report.imageUrl;
    const finalImageUrl = imageUrl?.startsWith("http")
        ? imageUrl
        : imageUrl
            ? `https://reportam-backend-sun4.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
            : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Report Details</SheetTitle>
                    <SheetDescription>View full details of this report</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 pb-6">
                    {/* Image */}
                    {finalImageUrl && (
                        <div className="rounded-lg overflow-hidden border bg-gray-50">
                            <img
                                src={finalImageUrl}
                                alt="Report"
                                className="w-full h-auto object-cover max-h-[400px]"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                                }}
                            />
                        </div>
                    )}

                    {/* Title & Timeline */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title || report.description?.substring(0, 50)}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            <span>Reported: {new Date(report.createdAt || report.date).toLocaleDateString()}</span>
                            {report.updatedAt && <span>• Updated: {new Date(report.updatedAt).toLocaleDateString()}</span>}
                        </div>
                    </div>

                    {/* Status & Category */}
                    <div className="flex flex-wrap gap-3">
                        <div>
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Status</span>
                            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Category</span>
                            <Badge variant="outline" className={getCategoryColor(report.category)}>{report.category}</Badge>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{report.description}</p>
                    </div>

                    {/* Location Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
                            <p className="text-gray-700 text-sm">{report.address_text || report.location || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">LGA / Community</h4>
                            <p className="text-gray-700 text-sm">{report.lga || "N/A"} {report.community_name ? `- ${report.community_name}` : ""}</p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
