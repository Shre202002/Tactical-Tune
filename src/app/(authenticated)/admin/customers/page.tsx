"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard, fetchCustomers } from "@/lib/admin";

export default function AdminCustomers() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => fetchCustomers(),
  });

  const { data: adminContext } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  return (
    <div>
      <h1 className="text-display text-3xl mb-6">
        Customers <span className="text-sm text-primary">({adminContext?.roleLabel ?? "staff"})</span>
      </h1>
      {adminContext?.role === "shop_manager" && (
        <p className="mb-4 rounded border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Shop manager view masks customer email and phone details. Order summaries remain visible for support.
        </p>
      )}
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
