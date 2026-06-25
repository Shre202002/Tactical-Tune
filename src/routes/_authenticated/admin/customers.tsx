import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  beforeLoad: async ({ context }) => {
    // Only super_admin
    if (!(context as any).isSuperAdmin) throw redirect({ to: "/admin" });
  },
  component: AdminCustomers,
});

function AdminCustomers() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, orders, carts] = await Promise.all([
        supabase.from("profiles").select("id,email,full_name,phone,created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id,status,total"),
        supabase.from("carts").select("user_id,status,updated_at,cart_items(id)"),
      ]);

      const oByUser: Record<string, { total: number; completed: number; pending: number; spent: number }> = {};
      for (const o of orders.data ?? []) {
        const u = (o as any).user_id;
        oByUser[u] = oByUser[u] || { total: 0, completed: 0, pending: 0, spent: 0 };
        oByUser[u].total++;
        if ((o as any).status === "paid" || (o as any).status === "fulfilled") {
          oByUser[u].completed++;
          oByUser[u].spent += Number((o as any).total ?? 0);
        }
        if ((o as any).status === "pending_payment") oByUser[u].pending++;
      }

      const cByUser: Record<string, { items: number; updated: string }> = {};
      for (const c of carts.data ?? []) {
        if ((c as any).status !== "active") continue;
        const items = (c as any).cart_items?.length ?? 0;
        if (items === 0) continue;
        cByUser[(c as any).user_id] = { items, updated: (c as any).updated_at };
      }

      return (profiles.data ?? []).map((p: any) => ({
        ...p,
        orders: oByUser[p.id] ?? { total: 0, completed: 0, pending: 0, spent: 0 },
        cart: cByUser[p.id] ?? null,
      }));
    },
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
