"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart } from "lucide-react";
import { fetchFeaturedProducts } from "@/lib/catalog";
import type { ProductRow } from "@/lib/domain";
import fallbackImg from "@/assets/cat-rifles.jpg";

import { ProductCard } from "./ProductCard";

function SkeletonCard() {
  return (
    <div className="bg-background border border-border rounded-sm overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 bg-muted animate-pulse rounded-sm" />
        <div className="h-4 w-full bg-muted animate-pulse rounded-sm" />
        <div className="h-6 w-1/2 bg-muted animate-pulse rounded-sm" />
      </div>
    </div>
  );
}

export function BestSellers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => fetchFeaturedProducts(8),
  });
  const products = data ?? [];

  if (!isLoading && !error && products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-tactical">
        <div className="text-center mb-12">
          <div className="text-display text-sm text-primary tracking-widest mb-2">▸ TOP RATED</div>
          <h2 className="text-display text-4xl md:text-5xl">Featured Arsenal</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            What our operators are firing this season. Verified, tested, and battle-proven.
          </p>
        </div>

        {error && (
          <p className="text-center text-destructive">Could not load products. Try refreshing.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
