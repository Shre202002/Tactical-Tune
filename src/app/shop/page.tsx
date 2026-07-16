import Link from "next/link";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchActiveProducts } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Gear — TacticalTune",
  description: "Browse our entire arsenal of tactical sports gear.",
};

export const dynamic = "force-dynamic";

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default async function ShopPage() {
  const products = await fetchActiveProducts();

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="container-tactical">
          <h1 className="text-display text-4xl md:text-5xl mb-4">Complete Arsenal</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Every piece of tactical gear we offer, all in one place. Engineered for precision, built for durability.
          </p>
        </div>
      </div>

      <div className="container-tactical mt-12">
        {products.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-lg">
            No equipment available in the arsenal at this time.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
