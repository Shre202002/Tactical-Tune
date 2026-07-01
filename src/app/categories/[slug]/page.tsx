import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { fetchActiveProducts, fetchCategories } from "@/lib/catalog";
import fallbackImg from "@/assets/cat-rifles.jpg";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const categories = await fetchCategories();
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} — TacticalTune`,
    description: category.description || `Browse our selection of ${category.name}.`,
  };
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  
  // Parallel fetch for speed
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchActiveProducts(params.slug)
  ]);

  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border py-12 md:py-16 relative overflow-hidden">
        {category.image && (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src={category.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="container-tactical relative z-10">
          <h1 className="text-display text-4xl md:text-5xl mb-4 text-primary">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground max-w-2xl text-lg">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="container-tactical mt-12">
        {products.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-lg">
            No equipment found in this category.
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
