import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Menu, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useAuth, signOut } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, isAdmin } = useAuth();

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="p-2 hover:text-primary">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/account">Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/orders"><Package className="w-4 h-4 mr-2" /> My orders</Link></DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><LayoutDashboard className="w-4 h-4 mr-2" /> Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="p-2 hover:text-primary text-sm text-display hidden sm:inline">Sign in</Link>
          )}

          <Link to="/cart" aria-label="Cart" className="p-2 hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
          </Link>
          <button aria-label="Menu" className="p-2 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
