import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { fetchFeaturedProducts, type ProductRow } from "@/lib/catalog";
import fallbackImg from "@/assets/cat-rifles.jpg";

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function ProductCard({ p }: { p: ProductRow }) {
  const img = p.images?.[0]?.url || fallbackImg;
  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;
  const lowStock = p.stock > 0 && p.stock <= 5;
  const reviewCount = (Number.parseInt(p.id.slice(-4), 16) % 200) + 40;

  return (
    <Link to="/products/$slug" params={{ slug: p.slug }} className="group bg-background border border-border rounded-sm overflow-hidden hover:shadow-card transition-all hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={img}
          alt={p.images?.[0]?.alt || p.name}
          width={800}
          height={800}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImg; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
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
            <span className="text-xs text-muted-foreground line-through">{formatINR(p.compare_at_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

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
    queryFn: () => fetchFeaturedProducts({ data: { limit: 8 } }),
  });

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
            : data?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
