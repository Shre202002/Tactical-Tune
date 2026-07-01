"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAdminDashboard, fetchAdminOrders, setAdminOrderStatus } from "@/lib/admin";
import type { OrderStatus } from "@/lib/domain";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const STATUSES = ["all", "pending_payment", "paid", "failed", "cancelled", "fulfilled", "refunded"] as const;

export default function AdminOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: () => fetchAdminOrders(filter),
  });

  const { data: adminContext } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchAdminDashboard(),
  });

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      await setAdminOrderStatus({ orderId: id, status });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update order");
    }
  }

  return (
    <div>
      <h1 className="text-display text-3xl mb-6">Orders</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded border ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Order #</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Items</th>
              <th className="text-right p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">
                  <div>{o.customer?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{o.customer?.email}</div>
                </td>
                <td className="p-3 text-xs">{o.order_items.map((it) => `${it.product_name} ×${it.quantity}`).join(", ")}</td>
                <td className="p-3 text-right">₹{Number(o.total).toLocaleString("en-IN")}</td>
                <td className="p-3"><Badge variant={o.status === "paid" || o.status === "fulfilled" ? "default" : "secondary"}>{o.status}</Badge></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)} className="text-xs border border-input rounded px-2 py-1 bg-background">
                    {STATUSES.slice(1).map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={adminContext?.role === "shop_manager" && s !== "fulfilled"}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
