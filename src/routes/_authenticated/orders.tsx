import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "@/lib/orders";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => fetchMyOrders(),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-tactical py-10">
        <h1 className="text-display text-4xl mb-6">My orders</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link to="/" className="text-primary hover:underline">Shop now →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-display text-lg">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <Badge variant={o.status === "paid" || o.status === "fulfilled" ? "default" : "secondary"}>
                    {o.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {o.order_items.map((it, i) => (
                    <span key={i}>{it.product_name} × {it.quantity}{i < o.order_items.length - 1 ? ", " : ""}</span>
                  ))}
                </div>
                <div className="text-right font-bold">₹{Number(o.total).toLocaleString("en-IN")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
