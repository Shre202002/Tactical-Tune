import { Instagram, Youtube, Facebook, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-dark text-surface-dark-foreground pt-16 pb-8">
      <div className="container-tactical grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-sm">
              <span className="text-display text-secondary text-lg leading-none">TT</span>
            </div>
            <span className="text-display text-2xl">
              Tactical<span className="text-primary">Tune</span>
            </span>
          </div>
          <p className="text-sm text-surface-dark-foreground/60 max-w-xs mb-4">
            India's premium tactical sports gear brand. Precision-built, operator-approved.
          </p>
          <form className="flex gap-2 max-w-sm">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-surface-dark-foreground/10 border border-surface-dark-foreground/20 rounded-sm px-3 py-2 text-sm placeholder:text-surface-dark-foreground/40 focus:outline-none focus:border-primary"
            />
            <button className="bg-primary text-primary-foreground text-display text-xs tracking-widest px-4 rounded-sm hover:bg-primary-glow transition-colors">
              ENLIST
            </button>
          </form>
        </div>

        {[
          { title: "Shop", links: ["Rifles", "Pistols", "Ammo", "Accessories", "New Arrivals"] },
          { title: "Support", links: ["Track Order", "Shipping", "Returns", "FAQ", "Contact"] },
          { title: "Brand", links: ["About", "Made in India", "Reviews", "Blog", "Careers"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-display text-sm tracking-widest text-primary mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-surface-dark-foreground/70 hover:text-primary transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-tactical border-t border-surface-dark-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-surface-dark-foreground/50">
          © {new Date().getFullYear()} TacticalTune. All rights reserved. Made in India.
        </p>
        <div className="flex items-center gap-4">
          {[Instagram, Youtube, Facebook, Mail].map((Icon, i) => (
            <a key={i} href="#" className="w-9 h-9 rounded-sm border border-surface-dark-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
