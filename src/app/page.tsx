import type { Metadata } from "next";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { BestSellers } from "@/components/site/BestSellers";
import { PromoBanner } from "@/components/site/PromoBanner";

export const metadata: Metadata = {
  title: "TacticalTune — Precision Tactical Sports Gear | Made in India",
  description:
    "India's premium tactical sports gear brand. Precision-built gear, secure checkout, and pan-India support.",
  openGraph: {
    title: "TacticalTune — Precision. Power. Tactical.",
    description:
      "Premium tactical sports gear, made in India for precision shooters.",
  },
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <BestSellers />
      <PromoBanner />
    </main>
  );
}
