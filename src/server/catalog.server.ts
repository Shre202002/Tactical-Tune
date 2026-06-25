import { ObjectId } from "mongodb";

import type {
  CategoryRow,
  ProductImage,
  ProductRow,
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
  name: string;
  slug: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  category_slug: string | null;
  sub_category: string | null;
  tags: string[];
  images: ProductImage[];
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  licence_required: boolean;
  power_plant: string | null;
  caliber: string | null;
  velocity: string | null;
  specifications: ProductSpec[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: Date;
  updated_at: Date;
};

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
  return {
    id: product._id.toHexString(),
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    short_description: product.short_description,
    description: product.description,
    sku: product.sku,
    price: Number(product.price),
    compare_at_price:
      product.compare_at_price == null ? null : Number(product.compare_at_price),
    category_slug: product.category_slug,
    sub_category: product.sub_category,
    tags: product.tags ?? [],
    images: product.images ?? [],
    stock: product.stock,
    low_stock_threshold: product.low_stock_threshold,
    is_active: product.is_active,
    is_featured: product.is_featured,
    licence_required: product.licence_required,
    power_plant: product.power_plant,
    caliber: product.caliber,
    velocity: product.velocity,
    specifications: product.specifications ?? [],
    seo_title: product.seo_title,
    seo_description: product.seo_description,
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
    .find({ is_active: true, is_featured: true })
    .sort({ created_at: -1 })
    .limit(Math.min(Math.max(limit, 1), 24))
    .toArray();
  return rows.map(serializeProduct);
}

export async function findProductBySlug(slug: string) {
  const products = await getCollection<ProductDocument>("products");
  const product = await products.findOne({ slug, is_active: true });
  return product ? serializeProduct(product) : null;
}

export async function listAllProducts() {
  const products = await getCollection<ProductDocument>("products");
  const rows = await products.find({}).sort({ created_at: -1 }).toArray();
  return rows.map(serializeProduct);
}

export async function productCountsByCategory() {
  const products = await getCollection<ProductDocument>("products");
  const rows = await products
    .aggregate<{ _id: string; count: number }>([
      { $match: { is_active: true, category_slug: { $ne: null } } },
      { $group: { _id: "$category_slug", count: { $sum: 1 } } },
    ])
    .toArray();
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}
