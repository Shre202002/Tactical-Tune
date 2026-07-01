"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronsRight,
  FolderTree,
  Home,
  Monitor,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppRole } from "@/lib/domain";
import { getAdminPermissions, getRoleLabel } from "@/lib/rbac";

type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  badge?: string;
};

function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function SidebarOption({
  href,
  icon: Icon,
  label,
  open,
  badge,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  open: boolean;
  badge?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={!open ? label : undefined}
      className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>

      {open && <span className="text-sm font-medium">{label}</span>}

      {badge && open && (
        <span className="absolute right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar({
  role,
  userEmail,
  userName,
}: {
  role: AppRole;
  userEmail: string;
  userName?: string | null;
}) {
  const [open, setOpen] = useState(true);
  const permissions = getAdminPermissions(role);
  const roleLabel = getRoleLabel(role);

  const links: SidebarLink[] = [
    { href: "/admin", label: "Dashboard", icon: Home, enabled: true },
    { href: "/admin/products", label: "Products", icon: Package, enabled: permissions.canManageProducts },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: FolderTree,
      enabled: permissions.canManageCategories,
    },
    { href: "/admin/promos", label: "Promos", icon: Tag, enabled: permissions.canManagePromos },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag, enabled: permissions.canViewTransactions },
    { href: "/admin/customers", label: "Customers", icon: Users, enabled: permissions.canViewCustomers },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r border-border bg-card p-2 shadow-sm transition-all duration-300 ease-in-out ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div className="mb-6 border-b border-border pb-4">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
        >
          <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {open && (
            <div className="min-w-0">
              <span className="block truncate font-display text-lg leading-tight">
                Tactical<span className="text-primary">Tune</span>
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {roleLabel} console
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="mb-8 space-y-1">
        {links
          .filter((link) => link.enabled)
          .map((link) => (
            <SidebarOption key={link.href} {...link} open={open} />
          ))}
        <SidebarOption href="/" icon={Monitor} label="View site" open={open} />
      </div>

      {open && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Access scope
          </div>
          <p className="text-muted-foreground">
            {role === "super_admin" && "Full platform, staff, audit, catalog, order and payment control."}
            {role === "admin" && "Operational control for catalog, customers, promos, orders and analytics."}
            {role === "shop_manager" && "Day-to-day products, inventory, fulfillment and product analytics."}
          </p>
        </div>
      )}

      <div className="absolute bottom-16 left-2 right-2">
        <div className="flex items-center gap-3 rounded-md border border-border bg-background/70 p-2">
          <div className="grid size-9 shrink-0 place-content-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {initials(userName, userEmail)}
          </div>
          {open && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{userName || roleLabel}</div>
              <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
            </div>
          )}
        </div>
      </div>

      {open && permissions.canManageSystemSettings && (
        <div className="absolute bottom-2 left-2 right-14">
          <div className="flex h-10 items-center gap-2 rounded-md px-3 text-xs text-muted-foreground">
            <Settings className="h-4 w-4" />
            System settings ready
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="absolute bottom-2 right-2 grid size-10 place-content-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        aria-label={open ? "Collapse admin sidebar" : "Expand admin sidebar"}
      >
        <ChevronsRight
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
    </aside>
  );
}
