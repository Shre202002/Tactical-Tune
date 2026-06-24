import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Categories } from "@/components/site/Categories";
import { BestSellers } from "@/components/site/BestSellers";
import { PromoBanner } from "@/components/site/PromoBanner";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TacticalTune — Precision Tactical Sports Gear | Made in India" },
      {
        name: "description",
        content:
          "India's premium tactical airgun brand. Rifles, pistols, ammo & accessories. No licence needed. Free pan-India delivery on orders over ₹2,499.",
      },
      { property: "og:title", content: "TacticalTune — Precision. Power. Tactical." },
      {
        property: "og:description",
        content: "Premium tactical sports gear, made in India. Shop rifles, pistols, ammo & accessories.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Categories />
        <BestSellers />
        <PromoBanner />
      </main>
      <Footer />
    </div>
  );
}
