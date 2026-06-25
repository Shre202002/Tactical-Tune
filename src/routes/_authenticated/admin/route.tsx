import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, FolderTree } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/auth" });
    const roles = [user.role];
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (!isAdmin) throw redirect({ to: "/" });
    return { roles, isSuperAdmin: user.role === "super_admin" };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isSuperAdmin } = Route.useRouteContext();
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 bg-secondary text-secondary-foreground p-4 flex-shrink-0">
        <Link to="/" className="text-display text-xl block mb-8">
          Tactical<span className="text-primary">Tune</span> <span className="text-xs text-primary">/admin</span>
        </Link>
        <nav className="space-y-1 text-sm">
          <NavItem to="/admin" icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavItem>
          <NavItem to="/admin/products" icon={<Package className="w-4 h-4" />}>Products</NavItem>
          <NavItem to="/admin/categories" icon={<FolderTree className="w-4 h-4" />}>Categories</NavItem>
          <NavItem to="/admin/promos" icon={<Tag className="w-4 h-4" />}>Promos</NavItem>
          <NavItem to="/admin/orders" icon={<ShoppingBag className="w-4 h-4" />}>Orders</NavItem>
          {isSuperAdmin && <NavItem to="/admin/customers" icon={<Users className="w-4 h-4" />}>Customers</NavItem>}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground"
    >
      {icon}{children}
    </Link>
  );
}
