import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { fetchCategories, fetchProductCountByCategory } from "@/lib/catalog";
import fallbackImg from "@/assets/cat-rifles.jpg";

export function Categories() {
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const countsQ = useQuery({ queryKey: ["product-counts"], queryFn: fetchProductCountByCategory });

  return (
    <section className="py-16 md:py-24" id="shop">
      <div className="container-tactical">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-display text-sm text-primary tracking-widest mb-2">▸ ARSENAL</div>
            <h2 className="text-display text-4xl md:text-5xl">Shop by Category</h2>
          </div>
          <a href="#" className="hidden md:inline-flex items-center gap-1 text-display text-sm tracking-widest hover:text-primary transition-colors">
            VIEW ALL <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {(catsQ.data ?? Array.from({ length: 4 })).map((c, i) => {
            const cat = c as ReturnType<typeof Object> as null | {
              slug: string; name: string; description: string | null; image: string | null;
            };
            const count = cat && countsQ.data ? countsQ.data[cat.slug] ?? 0 : 0;
            return (
              <a
                key={cat?.slug ?? i}
                href={cat ? `#category-${cat.slug}` : "#"}
                className="group relative block bg-card rounded-sm overflow-hidden border border-border hover:border-primary transition-all hover:-translate-y-1 hover:shadow-tactical"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {cat ? (
                    <img
                      src={cat.image || fallbackImg}
                      alt={cat.name}
                      width={800}
                      height={800}
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackImg; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted animate-pulse" />
                  )}
                </div>
                <div className="p-4 md:p-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 line-clamp-1">
                    {cat?.description ?? "Loading"}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-display text-lg md:text-xl line-clamp-1">{cat?.name ?? "—"}</h3>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">{count} items</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
