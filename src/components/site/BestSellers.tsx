import { Star, ShoppingCart } from "lucide-react";
import rifles from "@/assets/cat-rifles.jpg";
import pistols from "@/assets/cat-pistols.jpg";
import ammo from "@/assets/cat-ammo.jpg";
import accessories from "@/assets/cat-accessories.jpg";

const products = [
  { name: "Puncher Breaker Tactical", sku: "TT-RFL-014", price: 38999, compare: 44999, img: rifles, tag: "BESTSELLER", tagColor: "primary" },
  { name: "Stinger CO₂ Pistol", sku: "TT-PST-007", price: 12499, compare: null, img: pistols, tag: "NO LICENCE", tagColor: "success" },
  { name: "Heavy Pellets .177 (500ct)", sku: "TT-AMM-022", price: 899, compare: 1199, img: ammo, tag: "BUNDLE", tagColor: "warning" },
  { name: "Recon Scope 4x32 Mil-Dot", sku: "TT-OPT-031", price: 5499, compare: null, img: accessories, tag: "NEW", tagColor: "accent" },
];

const tagClasses: Record<string, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  accent: "bg-accent text-accent-foreground",
};

export function BestSellers() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container-tactical">
        <div className="text-center mb-12">
          <div className="text-display text-sm text-primary tracking-widest mb-2">▸ TOP RATED</div>
          <h2 className="text-display text-4xl md:text-5xl">Best Sellers</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            What our operators are firing this season. Verified, tested, and battle-proven.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <article key={p.sku} className="group bg-background border border-border rounded-sm overflow-hidden hover:shadow-card transition-all hover:-translate-y-1">
              <div className="relative aspect-square bg-muted overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-display text-[10px] tracking-widest px-2 py-1 rounded-sm ${tagClasses[p.tagColor]}`}>
                  {p.tag}
                </span>
                <button
                  aria-label="Add to cart"
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-1">{p.sku}</div>
                <h3 className="font-semibold text-foreground line-clamp-1 mb-2">{p.name}</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">(128)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-xl text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                  {p.compare && (
                    <span className="text-xs text-muted-foreground line-through">₹{p.compare.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
