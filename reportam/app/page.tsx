import { Navbar } from "@/components/Navbar";
import { Feed } from "@/components/Feed";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto flex-1">
        {/* Live Feed Section (Includes Search, Filters, Cards) */}
        <Feed />
      </main>

      <Footer />
    </div>
  );
}
