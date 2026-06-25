import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { fetchCartItems, updateCartItem, removeCartItem } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cart")({
  component: CartPage,
});

function CartPage() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return [];
      return fetchCartItems(data.user.id);
    },
  });

  const subtotal = items.reduce((s, it) => s + Number(it.unit_price) * it.quantity, 0);

  async function changeQty(itemId: string, qty: number) {
    await updateCartItem(itemId, qty);
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  async function remove(itemId: string) {
    await removeCartItem(itemId);
    toast.success("Removed");
    qc.invalidateQueries({ queryKey: ["cart"] });
  }

  async function checkout() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const total = subtotal;
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: data.user.id,
        subtotal,
        total,
        status: "pending_payment",
        payment_initiated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    const orderItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.products?.name ?? "",
      product_slug: it.products?.slug ?? "",
      product_image: it.products?.images?.[0]?.url ?? null,
      unit_price: it.unit_price,
      quantity: it.quantity,
      line_total: Number(it.unit_price) * it.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    toast.success("Order created — payment integration coming soon");
    window.location.href = "/orders";
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-tactical py-10">
        <h1 className="text-display text-4xl mb-6">Your cart</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/" className="text-primary hover:underline">Continue shopping →</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 bg-card border border-border rounded p-4">
                  <img
                    src={it.products?.images?.[0]?.url ?? "/placeholder.svg"}
                    alt={it.products?.name ?? ""}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link to="/products/$slug" params={{ slug: it.products?.slug ?? "" }} className="font-semibold hover:text-primary">
                      {it.products?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">₹{Number(it.unit_price).toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => changeQty(it.id, it.quantity - 1)} className="border border-border w-7 h-7 rounded">−</button>
                      <span className="w-8 text-center">{it.quantity}</span>
                      <button onClick={() => changeQty(it.id, it.quantity + 1)} className="border border-border w-7 h-7 rounded">+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{(Number(it.unit_price) * it.quantity).toLocaleString("en-IN")}</div>
                    <button onClick={() => remove(it.id)} className="text-destructive mt-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded p-6 h-fit">
              <h2 className="text-display text-xl mb-4">Order summary</h2>
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span className="text-success">Free</span></div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-bold text-lg mb-4"><span>Total</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <Button onClick={checkout} className="w-full btn-tactical-glow">Checkout</Button>
              <p className="text-[11px] text-muted-foreground mt-2">Payment integration (Razorpay) coming soon — order will be created with status "pending_payment".</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
