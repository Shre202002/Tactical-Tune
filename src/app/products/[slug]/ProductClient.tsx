"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Crosshair,
  Gauge,
  MessageSquare,
  PackageCheck,
  Shield,
  ShoppingCart,
  Star,
  Target,
  Truck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { addToCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { fetchProductReviews, submitProductReview } from "@/lib/reviews";
import { toast } from "sonner";
import type { ProductImage, ProductReviewRow, ProductRow } from "@/lib/domain";

function formatINR(value: number) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${iconClass} ${
            value <= Math.round(rating)
              ? "fill-warning text-warning"
              : "fill-muted text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

function normalizeImages(product: ProductRow): ProductImage[] {
  if (product.images?.length) return product.images;
  return [
    {
      url: "/placeholder.svg",
      alt: product.name,
      is_primary: true,
      order: 0,
    },
  ];
}

function ReviewCard({ review }: { review: ProductReviewRow }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{review.user_name}</h4>
            {review.is_verified_purchase && (
              <Badge variant="outline" className="border-success text-success">
                <BadgeCheck className="mr-1 h-3 w-3" />
                Verified purchase
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
      {review.review_images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.review_images.map((image) => (
            <img
              key={image.url}
              src={image.url}
              alt={image.alt}
              className="h-20 w-20 rounded border border-border object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}

export function ProductClient({ p }: { p: ProductRow }) {
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: user = null } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => getCurrentUser(),
    retry: false,
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", p.id],
    queryFn: () => fetchProductReviews(p.id),
  });

  const images = normalizeImages(p);
  const activeImage = images[Math.min(activeImg, images.length - 1)] ?? images[0];
  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
      : null;
  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      return Number(
        (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1),
      );
    }
    return p.analytics.average_rating;
  }, [p.analytics.average_rating, reviews]);
  const reviewCount = reviews.length || p.analytics.review_count;
  const redirectPath = `/products/${p.slug}`;

  const quickSpecs = [
    { label: "Power Plant", value: p.power_plant, icon: Zap },
    { label: "Caliber", value: p.caliber, icon: Crosshair },
    { label: "Velocity", value: p.velocity, icon: Gauge },
    { label: "Stock", value: p.stock > 0 ? `${p.stock} units` : "Out of stock", icon: PackageCheck },
  ].filter((item) => item.value);

  async function handleAdd() {
    setAdding(true);
    try {
      const currentUser = user ?? (await getCurrentUser());
      if (!currentUser) {
        window.location.href = `/auth?redirect=${encodeURIComponent(redirectPath)}`;
        return;
      }
      await addToCart({ productId: p.id, quantity: qty });
      toast.success(`Added ${qty} × ${p.name} to cart`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = `/auth?redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }
    setSubmittingReview(true);
    try {
      await submitProductReview({
        productId: p.id,
        rating: reviewRating,
        comment: reviewComment,
        review_images: [],
      });
      setReviewComment("");
      setReviewRating(5);
      await queryClient.invalidateQueries({ queryKey: ["product-reviews", p.id] });
      toast.success("Review saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save review");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_32%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--background)))]">
        <div className="container-tactical py-8">
          <nav className="mb-8 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <span className="capitalize">{p.category_slug?.replace(/-/g, " ") || "Product"}</span>
            <span>/</span>
            <span className="text-foreground">{p.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  {discount && <Badge className="bg-destructive text-destructive-foreground">-{discount}% OFF</Badge>}
                  {!p.licence_required && <Badge className="bg-success text-success-foreground">No Licence Required</Badge>}
                  {p.is_featured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
                </div>
                <div className="aspect-square bg-muted">
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt || p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      onClick={() => setActiveImg(index)}
                      className={`aspect-square overflow-hidden rounded-lg border bg-card transition ${
                        index === activeImg
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.alt || p.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              {p.brand && (
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary">{p.brand}</p>
              )}
              <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{p.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Stars rating={averageRating} size="md" />
                <span className="text-sm text-muted-foreground">
                  {averageRating ? `${averageRating}/5` : "No rating yet"} • {reviewCount} reviews
                </span>
                {p.sku && <span className="font-mono text-xs text-muted-foreground">SKU: {p.sku}</span>}
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="font-display text-4xl">{formatINR(p.price)}</span>
                  {p.compare_at_price && p.compare_at_price > p.price && (
                    <span className="mb-1 text-lg text-muted-foreground line-through">
                      {formatINR(p.compare_at_price)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Inclusive of all taxes. Shipping and handling calculated during checkout.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.stock > 0 ? (
                    <Badge variant="outline" className="border-success text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      In stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                  {p.requiresPremiumProtection && <Badge variant="secondary">Premium protection</Badge>}
                  {p.requiresHandling && <Badge variant="secondary">Special handling</Badge>}
                  {p.tags?.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                {p.short_description && (
                  <p className="mt-5 leading-7 text-muted-foreground">{p.short_description}</p>
                )}

                <div className="mt-6 flex gap-3">
                  <div className="flex items-center rounded-lg border border-border bg-background">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-3 hover:bg-accent"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(Math.max(p.stock, 1), qty + 1))}
                      className="px-4 py-3 hover:bg-accent"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    onClick={handleAdd}
                    disabled={adding || p.stock === 0}
                    className="flex-1 btn-tactical-glow"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {adding ? "Adding..." : "Add to cart"}
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-3">
                  <Shield className="mb-2 h-5 w-5 text-primary" />
                  Warranty support
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <Truck className="mb-2 h-5 w-5 text-primary" />
                  Secure shipping
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <Award className="mb-2 h-5 w-5 text-primary" />
                  Sport grade
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <Target className="mb-2 h-5 w-5 text-primary" />
                  Precision tested
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-tactical py-12">
        <section className="grid gap-4 md:grid-cols-4">
          {quickSpecs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="rounded-xl border border-border bg-card p-4">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{spec.label}</div>
                <div className="mt-1 font-semibold">{spec.value}</div>
              </div>
            );
          })}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl">Product Overview</h2>
            <div className="mt-4 whitespace-pre-line leading-8 text-muted-foreground">
              {p.description || p.short_description || "Product details will be updated soon."}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-3xl">Tactical Assurance</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Carefully listed with product-level stock and checkout validation.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {p.licence_required ? "Licence requirement is clearly marked." : "No licence requirement is clearly marked for faster decisions."}
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Product imagery is optimized in WebP through ImageKit.
              </li>
            </ul>
          </section>
        </div>

        {p.specifications.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-3xl">Technical Specifications</h2>
              <Badge variant="outline">{p.specifications.length} specs</Badge>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {p.specifications.map((spec, index) => (
                    <tr key={`${spec.key}-${index}`} className="border-b border-border last:border-0">
                      <td className="w-1/3 bg-muted/40 px-4 py-4 font-semibold text-muted-foreground">
                        {spec.key}
                      </td>
                      <td className="px-4 py-4">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl">Customer Reviews</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed-in customers can add or update their review for this product.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stars rating={averageRating} size="md" />
              <span className="font-display text-2xl">{averageRating || "—"}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl border border-border bg-background p-5">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" />
                Add a review
              </h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <LabelText>Rating</LabelText>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className="rounded p-1 hover:bg-accent"
                          aria-label={`Rate ${value} stars`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              value <= reviewRating
                                ? "fill-warning text-warning"
                                : "fill-muted text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <LabelText>Review</LabelText>
                    <Textarea
                      value={reviewComment}
                      onChange={(event) => setReviewComment(event.target.value)}
                      rows={5}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview} className="w-full btn-tactical-glow">
                    {submittingReview ? "Saving..." : "Submit review"}
                  </Button>
                </form>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-5 text-center">
                  <p className="text-sm text-muted-foreground">Please sign in to add a review.</p>
                  <Button asChild className="mt-4 w-full">
                    <Link href={`/auth?redirect=${encodeURIComponent(redirectPath)}`}>Sign in to review</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No reviews yet. Be the first customer to review this product.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LabelText({ children }: { children: ReactNode }) {
  return <div className="mb-1 text-sm font-medium">{children}</div>;
}
