import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { fetchActiveProducts } from "@/lib/catalog";
import fallbackImg from "@/assets/cat-rifles.jpg";
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
            {products.map((p) => {
              const reviewCount = (p.name.length % 15) + 12; // Deterministic pseudo-random for UI
              const image = p.images[0]?.url || fallbackImg.src;
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col bg-card border border-border rounded-sm overflow-hidden hover:border-primary transition-colors duration-300"
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <img
                      src={image}
                      alt={p.images[0]?.alt || p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      aria-label="Add to cart"
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-primary-foreground"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-1">
                      {p.brand?.toUpperCase()} • {p.sku}
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">{p.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-display text-xl text-foreground">{formatINR(p.price)}</span>
                      {p.compare_at_price && p.compare_at_price > p.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatINR(p.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
