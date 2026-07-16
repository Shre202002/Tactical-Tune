"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  checkoutCart,
  fetchCartItems,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const qc = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => fetchCartItems(),
  });

  const subtotal = items.reduce(
    (s, it) => s + Number(it.unit_price) * it.quantity,
    0,
  );

  async function changeQty(itemId: string, qty: number) {
    try {
      await updateCartItem({ itemId, quantity: qty });
      qc.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update cart",
      );
    }
  }

  async function remove(itemId: string) {
    try {
      await removeCartItem(itemId);
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove item",
      );
    }
  }

  async function checkout() {
    setIsProcessing(true);
    try {
      const res = await checkoutCart();
      if (!res.razorpayOrderId) {
        toast.success("Order created (No payment required / Gateway not configured)");
        window.location.href = "/orders";
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: res.amount,
        currency: "INR",
        name: "Tactical Hub Pro",
        description: "Order Payment",
        order_id: res.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              toast.success("Payment successful!");
              window.location.href = "/orders";
            } else {
              toast.error("Payment verification failed");
              setIsProcessing(false);
            }
          } catch (err) {
            toast.error("Failed to verify payment");
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#e22c2c",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed";
      toast.error(message);
      if (message.toLowerCase().includes("complete your profile")) {
        setTimeout(() => {
          window.location.href = "/account?completeProfile=1";
        }, 800);
      }
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container-tactical py-10">
        <h1 className="text-display text-4xl mb-6">Your cart</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link href="/" className="text-primary hover:underline">
              Continue shopping →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-4 bg-card border border-border rounded p-4"
                >
                  <img
                    src={it.products?.images?.[0]?.url ?? "/placeholder.svg"}
                    alt={it.products?.name ?? ""}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/products/${it.products?.slug ?? ""}`}
                      className="font-semibold hover:text-primary"
                    >
                      {it.products?.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      ₹{Number(it.unit_price).toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => changeQty(it.id, it.quantity - 1)}
                        disabled={isProcessing}
                        className="border border-border w-7 h-7 rounded disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{it.quantity}</span>
                      <button
                        onClick={() => changeQty(it.id, it.quantity + 1)}
                        disabled={isProcessing}
                        className="border border-border w-7 h-7 rounded disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ₹
                      {(Number(it.unit_price) * it.quantity).toLocaleString(
                        "en-IN",
                      )}
                    </div>
                    <button
                      onClick={() => remove(it.id)}
                      disabled={isProcessing}
                      className="text-destructive mt-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded p-6 h-fit">
              <h2 className="text-display text-xl mb-4">Order summary</h2>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <Button onClick={checkout} disabled={isProcessing} className="w-full btn-tactical-glow">
                {isProcessing ? "Processing..." : "Checkout securely"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
