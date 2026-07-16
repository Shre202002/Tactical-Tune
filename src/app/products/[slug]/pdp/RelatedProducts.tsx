"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveProducts } from "@/lib/catalog";
import type { ProductRow } from "@/lib/domain";
import fallbackImg from "@/assets/cat-rifles.jpg";

interface Props {
  currentProductId: string;
  categorySlug: string | null;
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function RelatedCard({ p }: { p: ProductRow }) {
  const img = p.images?.[0]?.url || fallbackImg.src;
  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;

  return (
    <Link
      href={`/products/${p.slug}`}
      className="group flex-shrink-0 w-52 sm:w-auto bg-card border border-border rounded-xl overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={img}
          alt={p.images?.[0]?.alt || p.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImg.src;
          }}
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
          {p.category_slug?.replace(/-/g, " ") || "Product"}
        </span>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 flex-1">{p.name}</h3>
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <Star key={v} className="w-3 h-3 fill-warning text-warning" />
          ))}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-base text-foreground">{formatINR(p.price)}</span>
          {p.compare_at_price && p.compare_at_price > p.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(p.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function RelatedProducts({ currentProductId, categorySlug }: Props) {
  const { data: allProducts = [] } = useQuery({
    queryKey: ["active-products", categorySlug],
    queryFn: () => fetchActiveProducts(categorySlug ?? undefined),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const related = allProducts
    .filter((p) => p.id !== currentProductId)
    .slice(0, 8);

  if (related.length === 0) return null;

  return (
    <section id="related-products" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="font-display text-3xl mb-6 border-b border-border pb-3"
      >
        You May Also Like
      </h2>

      {/* Mobile: horizontal scroll-snap | Desktop: grid */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible"
        style={{
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {related.map((p) => (
          <RelatedCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
