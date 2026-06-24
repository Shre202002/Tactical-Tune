import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container-tactical flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-secondary flex items-center justify-center rounded-sm">
            <span className="text-display text-primary text-lg leading-none">TT</span>
          </div>
          <span className="text-display text-xl md:text-2xl">
            Tactical<span className="text-primary">Tune</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Shop", "Rifles", "Pistols", "Ammo", "Accessories", "About"].map((l) => (
            <a key={l} href="#" className="text-display text-sm hover:text-primary transition-colors">
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button aria-label="Search" className="p-2 hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button aria-label="Account" className="p-2 hover:text-primary transition-colors hidden sm:block">
            <User className="w-5 h-5" />
          </button>
          <button aria-label="Cart" className="p-2 hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              0
            </span>
          </button>
          <button aria-label="Menu" className="p-2 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
