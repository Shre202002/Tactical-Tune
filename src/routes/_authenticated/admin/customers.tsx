import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomers } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  beforeLoad: async ({ context }) => {
    // Only super_admin
    if (!context.isSuperAdmin) throw redirect({ to: "/admin" });
  },
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => fetchCustomers(),
  });

  return (
    <div>
      <h1 className="text-display text-3xl mb-6">Customers <span className="text-sm text-primary">(super admin)</span></h1>
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3 text-warning">Pending payment</th>
              <th className="p-3 text-destructive">Abandoned cart</th>
              <th className="text-right p-3">Lifetime ₹</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">
                  <div>{r.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </td>
                <td className="p-3">{r.phone || "—"}</td>
                <td className="p-3 text-center">{r.orders.completed}/{r.orders.total}</td>
                <td className="p-3 text-center">{r.orders.pending || "—"}</td>
                <td className="p-3 text-center">{r.cart ? `${r.cart.items} items` : "—"}</td>
                <td className="p-3 text-right font-mono">₹{r.orders.spent.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
