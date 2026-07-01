import { ObjectId } from "mongodb";

import type {
  CategoryRow,
  ProductAnalytics,
  ProductFaq,
  ProductImage,
  ProductRow,
  ProductSeo,
  ProductShipping,
  ProductSpec,
} from "@/lib/domain";
import { getCollection } from "./database.server";

export type CategoryDocument = {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type ProductDocument = {
  _id: ObjectId;
  __v?: number;
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  currency?: string;
  price: number;
  compare_at_price: number | null;
  category_id?: ObjectId | null;
  category_slug: string | null;
  sub_category: string | null;
  tags: string[];
  images: ProductImage[];
  analytics?: ProductAnalytics;
  faqs?: ProductFaq[];
  stock: number;
  low_stock_threshold: number;
  track_inventory?: boolean;
  is_active: boolean;
  is_deleted?: boolean;
  is_featured: boolean;
  licence_required: boolean;
  requiresHandling?: boolean;
  requiresPremiumProtection?: boolean;
  power_plant: string | null;
  caliber: string | null;
  velocity: string | null;
  specifications: ProductSpec[];
  seo?: ProductSeo;
  seo_title: string | null;
  seo_description: string | null;
  shipping?: ProductShipping;
  visibility_priority?: number;
  created_by_admin?: string | null;
  updated_by_admin?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  created_at: Date;
  updated_at: Date;
};

export function defaultProductAnalytics(): ProductAnalytics {
  return {
    average_rating: 0,
    cart_add_count: 0,
    review_count: 0,
    share_count: 0,
    total_orders: 0,
    total_views: 0,
    wishlist_count: 0,
  };
}

export function defaultProductShipping(): ProductShipping {
  return {
    weight_kg: 0,
    shape: "box",
    package_dimensions_cm: {
      diameter: null,
      height: 0,
      length: null,
      width: null,
    },
  };
}

function normalizeProductImages(images: ProductImage[] | undefined, productName: string) {
  return (images ?? []).map((image, index) => ({
    ...image,
    alt: image.alt || productName,
    is_primary: index === 0 ? true : Boolean(image.is_primary),
    order: typeof image.order === "number" ? image.order : index,
    fileId: image.fileId ?? null,
    name: image.name ?? null,
    filePath: image.filePath ?? null,
    thumbnailUrl: image.thumbnailUrl ?? null,
  }));
}

export function serializeCategory(category: CategoryDocument): CategoryRow {
  return {
    id: category._id.toHexString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    sort_order: category.sort_order,
    is_active: category.is_active,
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}

export function serializeProduct(product: ProductDocument): ProductRow {
  const seo = product.seo ?? {
    meta_title: product.seo_title ?? product.name,
    meta_description: product.seo_description ?? product.short_description ?? "",
    meta_keywords: product.tags ?? [],
  };
  const createdAt = product.createdAt ?? product.created_at;
  const updatedAt = product.updatedAt ?? product.updated_at;
  return {
    id: product._id.toHexString(),
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    short_description: product.short_description,
    description: product.description,
    sku: product.sku,
    currency: product.currency ?? "INR",
    price: Number(product.price),
    compare_at_price:
      product.compare_at_price == null ? null : Number(product.compare_at_price),
    category_id: product.category_id ? product.category_id.toHexString() : null,
    category_slug: product.category_slug,
    sub_category: product.sub_category,
    tags: product.tags ?? [],
    images: normalizeProductImages(product.images, product.name),
    analytics: product.analytics ?? defaultProductAnalytics(),
    faqs: product.faqs ?? [],
    stock: product.stock,
    low_stock_threshold: product.low_stock_threshold,
    track_inventory: product.track_inventory ?? true,
    is_active: product.is_active,
    is_deleted: product.is_deleted ?? false,
    is_featured: product.is_featured,
    licence_required: product.licence_required,
    requiresHandling: product.requiresHandling ?? false,
    requiresPremiumProtection: product.requiresPremiumProtection ?? false,
    power_plant: product.power_plant,
    caliber: product.caliber,
    velocity: product.velocity,
    specifications: (product.specifications ?? []).map((spec) => ({
      ...spec,
      commonValue: spec.commonValue ?? spec.value,
    })),
    seo,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    shipping: product.shipping ?? defaultProductShipping(),
    visibility_priority: product.visibility_priority ?? 0,
    created_by_admin: product.created_by_admin ?? null,
    updated_by_admin: product.updated_by_admin ?? null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  };
}

export async function listCategories(options: { includeInactive?: boolean } = {}) {
  const categories = await getCollection<CategoryDocument>("categories");
  const filter = options.includeInactive ? {} : { is_active: true };
  const rows = await categories.find(filter).sort({ sort_order: 1, name: 1 }).toArray();
  return rows.map(serializeCategory);
}

export async function listFeaturedProducts(limit: number) {
  const products = await getCollection<ProductDocument>("products");
  const rows = await products
    .find({ is_active: true, is_featured: true, is_deleted: { $ne: true } })
    .sort({ created_at: -1 })
    .limit(Math.min(Math.max(limit, 1), 24))
    .toArray();
  return rows.map(serializeProduct);
}

export async function findProductBySlug(slug: string) {
  const products = await getCollection<ProductDocument>("products");
  const product = await products.findOne({ slug, is_active: true, is_deleted: { $ne: true } });
  return product ? serializeProduct(product) : null;
}

export async function listAllProducts() {
  const products = await getCollection<ProductDocument>("products");
  const rows = await products.find({}).sort({ created_at: -1 }).toArray();
  return rows.map(serializeProduct);
}

export async function listActiveProducts(categorySlug?: string) {
  const products = await getCollection<ProductDocument>("products");
  const filter: any = { is_active: true, is_deleted: { $ne: true } };
  if (categorySlug) {
    filter.category_slug = categorySlug;
  }
  const rows = await products.find(filter).sort({ created_at: -1 }).toArray();
  return rows.map(serializeProduct);
}

export async function productCountsByCategory() {
  const products = await getCollection<ProductDocument>("products");
  const rows = await products
    .aggregate<{ _id: string; count: number }>([
      { $match: { is_active: true, is_deleted: { $ne: true }, category_slug: { $ne: null } } },
      { $group: { _id: "$category_slug", count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}
