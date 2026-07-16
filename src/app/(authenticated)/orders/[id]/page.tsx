"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderById } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, Clock, ChevronLeft } from "lucide-react";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id),
  });

  const estimatedDelivery = useMemo(() => {
    if (!order) return null;
    const date = new Date(order.created_at);
    date.setDate(date.getDate() + 7); // Estimated 7 days
    return date;
  }, [order]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background container-tactical py-10">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background container-tactical py-10">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/orders" className="text-primary hover:underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  // Determine timeline steps based on status
  // statuses: pending, processing, shipped, fulfilled, cancelled, etc. (Assume paid -> processing -> fulfilled)
  const steps = [
    { label: "Order Confirmed", active: true, icon: CheckCircle2 },
    { label: "Processing", active: ["processing", "shipped", "fulfilled"].includes(order.status), icon: Clock },
    { label: "Dispatched", active: ["shipped", "fulfilled"].includes(order.status), icon: Package },
    { label: "Delivered", active: order.status === "fulfilled", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="border-b border-border bg-card">
        <div className="container-tactical py-6">
          <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-display text-3xl">Order #{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-display text-2xl text-primary">₹{Number(order.total).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-tactical py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking Timeline */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Track Package</h2>
              {estimatedDelivery && (
                <div className="text-sm font-medium">
                  Estimated Delivery: <span className="text-primary">{estimatedDelivery.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })} - {new Date(estimatedDelivery.getTime() + 86400000).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
            </div>
            
            <div className="relative pt-4">
              <div className="absolute top-8 left-6 right-6 h-1 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${(steps.filter(s => s.active).length - 1) / (steps.length - 1) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between relative z-10">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center w-1/4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-500 ${step.active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs sm:text-sm font-medium text-center mt-2 ${step.active ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-xl mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 border border-border rounded-lg bg-background items-center">
                  <div className="flex-1">
                    <Link href={`/products/${item.product_slug || item.product_id}`} className="font-semibold text-lg hover:text-primary transition-colors">
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{(Number(item.unit_price) * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Order Summary */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-xl mb-6">Payment Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-success font-medium">Free Delivery</span>
              </div>
              <div className="pt-3 mt-3 border-t border-border flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Payment Method</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-background">Razorpay Secure</Badge>
                {order.razorpay_order_id && (
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {order.razorpay_order_id.split('_')[1]}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Info */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="font-display text-xl mb-4">Delivery Address</h2>
            <div className="text-sm leading-relaxed text-muted-foreground">
              {order.shipping_address ? (
                <>
                  <p className="font-medium text-foreground mb-1">{String(order.shipping_address.name ?? "")}</p>
                  <p>{String(order.shipping_address.street ?? "")}</p>
                  <p>{String(order.shipping_address.city ?? "")}, {String(order.shipping_address.state ?? "")} {String(order.shipping_address.zip_code ?? "")}</p>
                  <p className="mt-2">📞 {String(order.shipping_address.phone ?? "")}</p>
                </>
              ) : (
                <p>No shipping address provided.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
