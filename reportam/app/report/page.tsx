import { Navbar } from "@/components/Navbar";
import { ReportWizard } from "@/components/ReportWizard";

export default function ReportPage() {
    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <main className="container mx-auto px-4 pt-24">
                <div className="max-w-2xl mx-auto mb-8 text-center">
                    <h1 className="text-3xl font-bold font-display mb-2">Submit a Report</h1>
                    <p className="text-muted-foreground">Your report helps improve the community. Please provide accurate details.</p>
                </div>
                <ReportWizard />
            </main>
        </div>
    );
}
