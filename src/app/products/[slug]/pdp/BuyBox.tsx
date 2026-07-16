"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, MessageCircle, CheckCircle2, Truck, Lock, IndianRupee, PhoneCall } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import type { ProductRow } from "@/lib/domain";

interface Props {
  p: ProductRow;
  user: { id: string } | null;
}

function formatINR(value: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

const COLOR_SWATCHES = [
  { label: "Standard", bg: "bg-zinc-900", border: "border-2 border-primary ring-2 ring-background" },
  { label: "Titanium", bg: "bg-zinc-500", border: "border border-border" },
  { label: "Coyote Tan", bg: "bg-[#c8a96e]", border: "border border-border" },
];

const TRUST_BADGES = [
  { icon: "🇮🇳", label: "100% Made in India" },
  { icon: "📜", label: "No Licence Required" },
  { icon: "🛡️", label: "Manufacturer Warranty" },
  { icon: "🚚", label: "Free pan-India Delivery" },
  { icon: "🔒", label: "Secure Checkout" },
  { icon: "📞", label: "Customer Support" },
];

export function BuyBox({ p, user }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;

  const waMessage = encodeURIComponent(
    `Hi! I'm interested in the ${p.name} (₹${Math.round(p.price).toLocaleString("en-IN")}). Could you please share more details?`
  );

  async function handleAdd(redirect: boolean = false) {
    setAdding(true);
    try {
      const currentUser = user ?? (await getCurrentUser());
      if (!currentUser) {
        router.push(`/auth?redirect=${encodeURIComponent(`/products/${p.slug}`)}`);
        return;
      }
      await addToCart({ productId: p.id, quantity: 1 });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Added ${p.name} to cart`);
      if (redirect) router.push("/cart");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Breadcrumb */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
      >
        ← All Products
      </Link>

      {/* 2. Category pill */}
      <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
        {p.category_slug?.replace(/-/g, " ") || "Product"}
      </span>

      {/* 3. Title */}
      <h1 className="font-display text-4xl md:text-5xl leading-tight">{p.name}</h1>

      {/* 4. Short description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {p.short_description || p.description}
      </p>

      {/* 5. Price block */}
      <div className="flex items-end gap-3 flex-wrap">
        <span className="font-display text-4xl text-foreground">{formatINR(p.price)}</span>
        {discount && (
          <>
            <span className="text-lg text-muted-foreground line-through mb-0.5">
              {formatINR(p.compare_at_price!)}
            </span>
            <span className="bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-1 rounded-full mb-1">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      {/* 6. Trust badge */}
      <div className="flex items-center gap-3 p-3.5 rounded-lg border border-success/30 bg-success/8">
        <ShieldCheck className="w-7 h-7 text-success shrink-0" />
        <div>
          <p className="font-display text-success text-sm uppercase tracking-widest">
            1-Year Manufacturer Warranty
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Shoot tension-free — we've got you covered.
          </p>
        </div>
      </div>

      {/* 7. Colour swatches */}
      <div>
        <p className="text-sm mb-2.5">
          Colour:{" "}
          <strong className="text-foreground font-semibold">
            {COLOR_SWATCHES[activeColor].label}
          </strong>
        </p>
        <div className="flex gap-2.5">
          {COLOR_SWATCHES.map((swatch, idx) => (
            <button
              key={swatch.label}
              onClick={() => setActiveColor(idx)}
              aria-label={`Select colour: ${swatch.label}`}
              aria-pressed={idx === activeColor}
              title={swatch.label}
              className={`w-9 h-9 rounded-full ${swatch.bg} transition-all focus-visible:outline-2 focus-visible:outline-primary ${
                idx === activeColor
                  ? "border-2 border-primary ring-2 ring-primary/40 scale-110"
                  : "border border-border hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 8 + 9. CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleAdd(false)}
          disabled={adding || p.stock === 0}
          id="add-to-cart-btn"
          className="flex-1 bg-card border-2 border-primary text-primary hover:bg-primary/5 font-bold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50 text-sm uppercase tracking-wider"
        >
          {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          onClick={() => handleAdd(true)}
          disabled={adding || p.stock === 0}
          id="buy-now-btn"
          className="flex-1 btn-tactical-glow bg-primary text-primary-foreground font-bold py-3.5 px-4 rounded-lg disabled:opacity-50 text-sm uppercase tracking-wider"
        >
          ⚡ Buy Now
        </button>
      </div>
      {!p.licence_required && (
        <p className="text-xs text-success font-medium text-center -mt-2">
          ✓ No Licence Required — Anyone can purchase this product
        </p>
      )}

      {/* 10. WhatsApp card */}
      <a
        href={`https://wa.me/910000000000?text=${waMessage}`}
        target="_blank"
        rel="noreferrer"
        id="whatsapp-support-link"
        className="flex items-center gap-3 p-4 bg-[#25D366]/8 border border-[#25D366]/30 rounded-lg hover:bg-[#25D366]/15 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#25D366]">Need Help? Chat on WhatsApp</p>
          <p className="text-xs text-muted-foreground">Usually replies within 2 mins</p>
        </div>
      </a>

      {/* 11. Stock / delivery line */}
      <p className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
        <span className={`font-medium ${p.stock > 0 ? "text-success" : "text-destructive"}`}>
          {p.stock > 0 ? `✓ In stock (${p.stock} units)` : "✗ Out of stock"}
        </span>
        <span>·</span>
        <span>Dispatched in 2–3 working days</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Truck className="w-3 h-3" /> Free pan-India delivery
        </span>
      </p>

      {/* 12. Trust strip badges */}
      <div className="flex flex-wrap gap-2">
        {TRUST_BADGES.filter((b) => p.licence_required || b.label !== "No Licence Required").map(
          (badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1.5 bg-muted text-muted-foreground text-[10px] font-semibold px-2.5 py-1.5 rounded-full uppercase tracking-wider"
            >
              {badge.icon} {badge.label}
            </span>
          )
        )}
      </div>

      {/* 14. Combo Bonus */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-primary font-bold text-xs uppercase tracking-wider mb-2">🎁 Combo Bonus</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Looking at our PCP rifles? The{" "}
          <strong className="text-foreground">Tactical Combos</strong> include a{" "}
          <strong className="text-foreground">
            Telescopic Scope + Hand Pump + Padded Bag + Pellets
          </strong>{" "}
          — all free.
        </p>
        <Link
          href="/products?cat=Combos"
          className="text-primary text-xs font-bold hover:underline"
        >
          See Combos →
        </Link>
      </div>
    </div>
  );
}
