"use server";

import type { ProductReviewImage } from "./domain";

export async function fetchProductReviews(productId: string) {
  const { listProductReviews } = await import("@/server/reviews.server");
  return listProductReviews(productId);
}

export async function submitProductReview(input: {
  productId: string;
  rating: number;
  comment: string;
  review_images?: ProductReviewImage[];
}) {
  const { createProductReview } = await import("@/server/reviews.server");
  return createProductReview(input);
}
