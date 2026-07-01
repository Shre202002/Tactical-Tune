"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Package,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Users,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { fetchAdminDashboard } from "@/lib/admin";
import { ADMIN_PERMISSION_MATRIX } from "@/lib/rbac";

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <div className="font-display text-3xl">{value}</div>
      {note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>}
    </div>
  );
}

function PermissionIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
  ) : (
    <XCircle className="mx-auto h-4 w-4 text-muted-foreground/50" />
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  if (!stats) {
    return (
      <div className="grid min-h-[50vh] place-content-center text-sm text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  const paidOrders = (stats.byStatus.paid?.count ?? 0) + (stats.byStatus.fulfilled?.count ?? 0);
  const failedPayments = stats.byStatus.failed?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {stats.roleLabel}
            </div>
            <h1 className="font-display text-4xl">TacticalTune Admin Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Role-aware control center for products, inventory, orders, customers, promos,
              analytics and privileged audit visibility.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[520px]">
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-muted-foreground">Customers</div>
              <div className="font-display text-2xl">{stats.customerCount}</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-muted-foreground">Staff</div>
              <div className="font-display text-2xl">{stats.staffCount}</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-muted-foreground">Promos</div>
              <div className="font-display text-2xl">{stats.promoCount}</div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-muted-foreground">Orders</div>
              <div className="font-display text-2xl">{stats.orderCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Products"
          value={stats.productCount}
          note={`${stats.lowStockCount} low-stock alerts`}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Revenue"
          value={formatMoney(stats.totalRevenue)}
          note={`${paidOrders} paid / fulfilled orders`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending payment"
          value={stats.byStatus.pending_payment?.count ?? 0}
          note={`${failedPayments} failed payments`}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Abandoned carts"
          value={stats.abandonedCount}
          note={`${stats.activeCartCount} active carts right now`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Orders & payment status
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.byStatus).map(([status, value]) => (
              <div key={status} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {value.count} orders • {formatMoney(value.total)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, Math.max(4, (value.count / Math.max(stats.orderCount, 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.byStatus).length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No order data yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Cart abandonment
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Active</div>
                <div className="font-display text-3xl">{stats.activeCartCount}</div>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4">
                <div className="text-xs uppercase tracking-wider text-destructive">Abandoned</div>
                <div className="font-display text-3xl text-destructive">{stats.abandonedCount}</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Abandoned means an active cart with items and no update for more than 1 hour.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <Activity className="h-5 w-5 text-primary" />
              Your access
            </h2>
            <div className="space-y-2 text-sm">
              {stats.restrictions.map((restriction) => (
                <div key={restriction} className="rounded-lg bg-muted/50 px-3 py-2">
                  {restriction}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
            <BarChart3 className="h-5 w-5 text-primary" />
            RBAC permission matrix
          </h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="p-3 text-left">Capability</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Shop Manager</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_PERMISSION_MATRIX.map((row) => (
                  <tr key={row.capability} className="border-t border-border">
                    <td className="p-3">{row.capability}</td>
                    <td className="p-3 text-center"><PermissionIcon allowed={row.super_admin} /></td>
                    <td className="p-3 text-center"><PermissionIcon allowed={row.admin} /></td>
                    <td className="p-3 text-center"><PermissionIcon allowed={row.shop_manager} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
            <Tag className="h-5 w-5 text-primary" />
            Privileged audit trail
          </h2>
          {stats.permissions.canViewAuditLogs ? (
            <div className="space-y-3">
              {stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{log.action.replace(/\./g, " ")}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {log.actor_email} • {log.target_type}
                  </div>
                </div>
              ))}
              {stats.recentAuditLogs.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No privileged actions logged yet.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Audit logs are super-admin-only. Your actions are still recorded server-side.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="Catalog authority"
          value={stats.permissions.canDeleteProducts ? "Full CRUD" : "Add / edit"}
          note={stats.permissions.canDeleteProducts ? "Product deletion allowed" : "Deletion is blocked server-side"}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Customer authority"
          value={stats.permissions.canBlockCustomers ? "Manage" : "View only"}
          note={stats.permissions.canBlockCustomers ? "Blocking is allowed" : "Sensitive data is limited"}
        />
        <StatCard
          icon={<Tag className="h-5 w-5" />}
          label="Marketing authority"
          value={stats.permissions.canManagePromos ? "Promos allowed" : "Restricted"}
          note="Promo writes are checked on the server"
        />
      </div>
    </div>
  );
}
