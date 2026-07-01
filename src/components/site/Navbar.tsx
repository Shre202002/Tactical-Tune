"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User, Menu, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { signOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const primaryLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const navLinkClass = (href: string) =>
    cn(
      "text-display text-sm transition-colors",
      isActive(href) ? "text-primary" : "hover:text-primary",
    );

  const mobileLinkClass = (href: string) =>
    cn(
      "block rounded-sm px-3 py-2 text-display text-sm transition-colors",
      isActive(href)
        ? "bg-primary/10 text-primary"
        : "text-foreground hover:bg-muted hover:text-primary",
    );

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container-tactical flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-secondary flex items-center justify-center rounded-sm">
            <span className="text-display text-primary text-lg leading-none">TT</span>
          </div>
          <span className="text-display text-xl md:text-2xl">
            Tactical<span className="text-primary">Tune</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
              {link.label}
            </Link>
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
                <DropdownMenuItem asChild><Link href="/account">Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/orders"><Package className="w-4 h-4 mr-2" /> My orders</Link></DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin"><LayoutDashboard className="w-4 h-4 mr-2" /> Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { signOut().then(() => { window.location.href = "/"; }); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth" className="p-2 hover:text-primary text-sm text-display hidden sm:inline">Sign in</Link>
          )}

          <Link href="/cart" aria-label="Cart" className="p-2 hover:text-primary transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Menu" className="p-2 hover:text-primary md:hidden">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[82vw] max-w-sm">
              <SheetHeader className="text-left">
                <SheetTitle className="text-display text-2xl">
                  Tactical<span className="text-primary">Tune</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 space-y-1">
                <SheetClose asChild>
                  <Link href="/" className={mobileLinkClass("/")}>
                    Home
                  </Link>
                </SheetClose>
                {primaryLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className={mobileLinkClass(link.href)}>
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="border-t border-border my-3" />
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/account" className={mobileLinkClass("/account")}>
                        Account
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/orders" className={mobileLinkClass("/orders")}>
                        My orders
                      </Link>
                    </SheetClose>
                    {isAdmin && (
                      <SheetClose asChild>
                        <Link href="/admin" className={mobileLinkClass("/admin")}>
                          Admin
                        </Link>
                      </SheetClose>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        signOut().then(() => {
                          window.location.href = "/";
                        });
                      }}
                      className="block w-full rounded-sm px-3 py-2 text-left text-display text-sm text-foreground hover:bg-muted hover:text-primary"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link href="/auth" className={mobileLinkClass("/auth")}>
                      Sign in
                    </Link>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
