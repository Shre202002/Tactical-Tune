import { ArrowUpRight } from "lucide-react";
import rifles from "@/assets/cat-rifles.jpg";
import pistols from "@/assets/cat-pistols.jpg";
import ammo from "@/assets/cat-ammo.jpg";
import accessories from "@/assets/cat-accessories.jpg";

const cats = [
  { name: "Rifles", count: 24, img: rifles, tag: "Long range" },
  { name: "Pistols", count: 18, img: pistols, tag: "CCW ready" },
  { name: "Ammo", count: 42, img: ammo, tag: "Pellets & CO₂" },
  { name: "Accessories", count: 60, img: accessories, tag: "Optics & gear" },
];

export function Categories() {
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
          {cats.map((c) => (
            <a
              key={c.name}
              href="#"
              className="group relative block bg-card rounded-sm overflow-hidden border border-border hover:border-primary transition-all hover:-translate-y-1 hover:shadow-tactical"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={c.img}
                  alt={c.name}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 md:p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{c.tag}</div>
                <div className="flex items-center justify-between">
                  <h3 className="text-display text-xl md:text-2xl">{c.name}</h3>
                  <span className="text-xs text-muted-foreground font-mono">{c.count} items</span>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
