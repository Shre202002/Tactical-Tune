import { ObjectId } from "mongodb";

import type { ProductReviewImage, ProductReviewRow } from "@/lib/domain";
import { requireUser } from "./auth.server";
import { getCollection } from "./database.server";
import type { ProductDocument } from "./catalog.server";
import type { OrderDocument } from "./store.server";

type ProductReviewDocument = {
  _id: ObjectId;
  __v: number;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  review_images: ProductReviewImage[];
  status: string;
  is_verified_purchase: boolean;
  likes_count: number;
  createdAt: Date;
  updatedAt: Date;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serializeReview(review: ProductReviewDocument): ProductReviewRow {
  return {
    id: review._id.toHexString(),
    __v: review.__v,
    product_id: review.product_id,
    user_id: review.user_id,
    user_name: review.user_name,
    rating: Number(review.rating),
    comment: review.comment,
    review_images: review.review_images ?? [],
    status: review.status,
    is_verified_purchase: Boolean(review.is_verified_purchase),
    likes_count: Number(review.likes_count ?? 0),
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}

async function updateProductReviewAnalytics(productId: string) {
  const [reviews, products] = await Promise.all([
    getCollection<ProductReviewDocument>("productReviews"),
    getCollection<ProductDocument>("products"),
  ]);
  const rows = await reviews
    .find({ product_id: productId, status: "approved" })
    .project<{ rating: number }>({ rating: 1 })
    .toArray();
  const reviewCount = rows.length;
  const average =
    reviewCount === 0
      ? 0
      : Number(
          (rows.reduce((sum, review) => sum + Number(review.rating), 0) / reviewCount).toFixed(1),
        );
  const now = new Date();

  await products.updateOne(
    { _id: new ObjectId(productId) },
    {
      $set: {
        "analytics.average_rating": average,
        "analytics.review_count": reviewCount,
        updatedAt: now,
        updated_at: now,
      },
    },
  );
}

export async function listProductReviews(productId: string) {
  if (!ObjectId.isValid(productId)) return [];
  const reviews = await getCollection<ProductReviewDocument>("productReviews");
  const rows = await reviews
    .find({ product_id: productId, status: "approved" })
    .sort({ createdAt: -1 })
    .toArray();
  return rows.map(serializeReview);
}

export async function createProductReview(input: {
  productId: string;
  rating: number;
  comment: string;
  review_images?: ProductReviewImage[];
}) {
  const user = await requireUser();
  if (!ObjectId.isValid(input.productId)) throw new Error("Invalid product.");

  const rating = Math.max(1, Math.min(5, Math.floor(Number(input.rating))));
  const comment = clean(input.comment);
  if (comment.length < 10) throw new Error("Please write at least 10 characters.");
  if (comment.length > 1200) throw new Error("Review comment is too long.");

  const productObjectId = new ObjectId(input.productId);
  const [products, orders, reviews] = await Promise.all([
    getCollection<ProductDocument>("products"),
    getCollection<OrderDocument>("orders"),
    getCollection<ProductReviewDocument>("productReviews"),
  ]);
  const product = await products.findOne({
    _id: productObjectId,
    is_active: true,
    is_deleted: { $ne: true },
  });
  if (!product) throw new Error("Product not found.");

  const verifiedOrder = await orders.findOne({
    user_id: new ObjectId(user.id),
    status: { $in: ["paid", "fulfilled"] },
    "order_items.product_id": productObjectId,
  });

  const now = new Date();
  const userName =
    user.full_name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0];
  const reviewImages = (input.review_images ?? []).map((image) => ({
    url: clean(image.url),
    alt: clean(image.alt) || `${product.name} review image`,
  })).filter((image) => image.url);

  const existing = await reviews.findOne({
    product_id: input.productId,
    user_id: user.id,
  });

  if (existing) {
    const result = await reviews.findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          rating,
          comment,
          review_images: reviewImages,
          user_name: userName,
          status: "approved",
          is_verified_purchase: Boolean(verifiedOrder),
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );
    if (!result) throw new Error("Could not update review.");
    await updateProductReviewAnalytics(input.productId);
    return serializeReview(result);
  }

  const review: ProductReviewDocument = {
    _id: new ObjectId(),
    __v: 0,
    product_id: input.productId,
    user_id: user.id,
    user_name: userName,
    rating,
    comment,
    review_images: reviewImages,
    status: "approved",
    is_verified_purchase: Boolean(verifiedOrder),
    likes_count: 0,
    createdAt: now,
    updatedAt: now,
  };

  await reviews.insertOne(review);
  await updateProductReviewAnalytics(input.productId);
  return serializeReview(review);
}
