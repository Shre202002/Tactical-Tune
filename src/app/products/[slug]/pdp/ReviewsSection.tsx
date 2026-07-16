"use client";

import { useState, useMemo, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, BadgeCheck, ThumbsUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchProductReviews, submitProductReview } from "@/lib/reviews";
import { toast } from "sonner";
import type { ProductRow, ProductReviewRow } from "@/lib/domain";

const REVIEWS_PER_PAGE = 5;

interface Props {
  p: ProductRow;
  user: { id: string } | null;
  initialAverageRating: number;
  initialReviewCount: number;
}

function Stars({
  rating,
  interactive = false,
  onRate,
}: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type={interactive ? "button" : undefined}
          role={interactive ? "radio" : undefined}
          aria-checked={interactive ? v === Math.round(rating) : undefined}
          aria-label={interactive ? `${v} star${v > 1 ? "s" : ""}` : undefined}
          onClick={() => interactive && onRate?.(v)}
          className={interactive ? "p-0.5 hover:scale-110 transition-transform" : "cursor-default"}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            className={`h-5 w-5 ${
              v <= Math.round(rating)
                ? "fill-warning text-warning"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-muted-foreground font-medium">{star}</span>
      <Star className="w-3 h-3 fill-warning text-warning shrink-0" />
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-warning rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-muted-foreground">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReviewRow }) {
  const initials = review.user_name.substring(0, 2).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-display text-sm text-primary shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{review.user_name}</span>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-[10px] text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Confirmed Buyer
                </span>
              )}
            </div>
            <Stars rating={review.rating} />
          </div>
        </div>
        <time className="text-xs text-muted-foreground shrink-0">{date}</time>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
      {review.likes_count > 0 && (
        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ThumbsUp className="w-3 h-3" /> {review.likes_count} found this helpful
        </p>
      )}
    </article>
  );
}

export function ReviewsSection({ p, user, initialAverageRating, initialReviewCount }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const { data: reviews = [] } = useQuery({
    queryKey: ["product-reviews", p.id],
    queryFn: () => fetchProductReviews(p.id),
  });

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      return Number(
        (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      );
    }
    return initialAverageRating;
  }, [reviews, initialAverageRating]);

  const reviewCount = reviews.length || initialReviewCount;

  const ratingBreakdown = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { counts[Math.round(r.rating)] = (counts[Math.round(r.rating)] || 0) + 1; });
    return counts;
  }, [reviews]);

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(`/products/${p.slug}`)}`);
      return;
    }
    setSubmittingReview(true);
    try {
      await submitProductReview({ productId: p.id, rating: reviewRating, comment: reviewComment, review_images: [] });
      setReviewComment("");
      setReviewRating(5);
      await queryClient.invalidateQueries({ queryKey: ["product-reviews", p.id] });
      toast.success("Review saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save review");
    } finally {
      setSubmittingReview(false);
    }
  }

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <section id="reviews" aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="font-display text-3xl mb-6 border-b border-border pb-3"
      >
        Customer Reviews
      </h2>

      {/* Rating summary + breakdown */}
      <div className="flex flex-col sm:flex-row gap-6 bg-card border border-border rounded-xl p-5 mb-8">
        <div className="flex flex-col items-center justify-center min-w-[100px] gap-1">
          <span className="font-display text-5xl text-foreground leading-none">
            {averageRating || "—"}
          </span>
          <Stars rating={averageRating} />
          <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar
              key={star}
              star={star}
              count={ratingBreakdown[star] || 0}
              total={reviewCount}
            />
          ))}
        </div>
      </div>

      {/* Review form or login CTA */}
      <div className="mb-8">
        {user ? (
          <form
            onSubmit={handleReviewSubmit}
            className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border"
          >
            <p className="text-sm font-semibold">Write a Review</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Your rating:</span>
              <Stars rating={reviewRating} interactive onRate={setReviewRating} />
            </div>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="text-sm"
              rows={3}
              required
            />
            <Button
              type="submit"
              disabled={submittingReview}
              className="w-full btn-tactical-glow text-sm"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <div className="text-center p-5 bg-muted/30 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Have this product? Share your experience.
            </p>
            <Button asChild variant="outline" className="text-sm">
              <Link href={`/auth?redirect=${encodeURIComponent(`/products/${p.slug}`)}`}>
                Login to Write a Review
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Review cards */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          <>
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {visibleCount < reviews.length && (
              <button
                onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
                className="w-full py-3 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors font-medium"
              >
                Load more reviews ({reviews.length - visibleCount} remaining)
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
            No reviews yet. Be the first to share your experience!
          </p>
        )}
      </div>
    </section>
  );
}
