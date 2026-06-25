import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard } from "@/lib/admin";
import { Package, ShoppingBag, AlertCircle, CheckCircle2, Clock, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-display text-3xl mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Package className="w-5 h-5" />} label="Products" value={stats.productCount} />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-success" />}
          label="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-warning" />}
          label="Pending payment"
          value={stats.byStatus.pending_payment?.count ?? 0}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
          label="Abandoned carts"
          value={stats.abandonedCount}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded p-5">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Orders by status</h2>
          <ul className="text-sm space-y-1">
            {Object.entries(stats.byStatus).map(([s, v]) => (
              <li key={s} className="flex justify-between">
                <span className="capitalize">{s.replace(/_/g, " ")}</span>
                <span className="font-mono">{v.count} • ₹{v.total.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded p-5">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Carts</h2>
          <p className="text-sm">Active: <span className="font-bold">{stats.activeCartCount}</span></p>
          <p className="text-sm">Abandoned (&gt;1hr inactive): <span className="font-bold text-destructive">{stats.abandonedCount}</span></p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-card border border-border rounded p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">{icon}{label}</div>
      <div className="text-display text-2xl mt-1">{value}</div>
    </div>
  );
}
