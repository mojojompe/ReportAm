import { Navbar } from "@/components/Navbar";
import { Feed } from "@/components/Feed";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome / Call to Action Section */}
        <section className="mb-12 text-center space-y-4">
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Join the community in making our environment safer and better. Report infrastructure, environmental, and safety issues instantly.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/report">
              <Button size="lg" className="rounded-full px-8 text-base">
                Start Reporting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Live Feed Section */}
        <Feed />
      </main>
    </div>
  );
}
