"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { ProductRow } from "@/lib/domain";
import fallbackImg from "@/assets/cat-rifles.jpg";

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function ProductCard({ p }: { p: ProductRow }) {
  const router = useRouter();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const img = p.images?.[0]?.url || fallbackImg.src;
  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;
  const lowStock = p.stock > 0 && p.stock <= 5;
  const reviewCount = p.analytics?.review_count || (Number.parseInt(p.id.slice(-4), 16) % 200) + 40;

  const qc = useQueryClient();

  async function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/auth?redirect=/cart`);
      return;
    }
    setAdding(true);
    try {
      await addToCart({ productId: p.id, quantity: 1 });
      await qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Added ${p.name} to cart`);
      router.push("/cart");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group relative bg-background border border-border rounded-sm overflow-hidden hover:shadow-card transition-all hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Link href={`/products/${p.slug}`} className="absolute inset-0" aria-label={p.name}>
          <img
            src={img}
            alt={p.images?.[0]?.alt || p.name}
            width={800}
            height={800}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImg.src;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {!p.licence_required && (
            <span className="text-display text-[10px] tracking-widest px-2 py-1 rounded-sm bg-success text-success-foreground">
              NO LICENCE
            </span>
          )}
          {discount && (
            <span className="text-display text-[10px] tracking-widest px-2 py-1 rounded-sm bg-primary text-primary-foreground">
              -{discount}%
            </span>
          )}
          {lowStock && (
            <span className="text-display text-[10px] tracking-widest px-2 py-1 rounded-sm bg-warning text-warning-foreground">
              ONLY {p.stock} LEFT
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <button
            onClick={handleBuyNow}
            disabled={adding || p.stock === 0}
            className="btn-tactical-glow w-full py-2.5 text-xs h-auto disabled:opacity-50"
          >
            {adding ? "Processing..." : p.stock === 0 ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      </div>
      <Link href={`/products/${p.slug}`} className="p-4 flex flex-col flex-1">
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
            <span className="text-xs text-muted-foreground line-through">{formatINR(p.compare_at_price)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
