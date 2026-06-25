import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type {
  CategoryRow,
  ProductImage,
  ProductRow,
  ProductSpec,
} from "./domain";

export const fetchCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { listCategories } = await import("@/server/catalog.server");
  return listCategories();
});

export const fetchFeaturedProducts = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number().int().min(1).max(24).default(8) }))
  .handler(async ({ data }) => {
    const { listFeaturedProducts } = await import("@/server/catalog.server");
    return listFeaturedProducts(data.limit);
  });

export const fetchProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(180) }))
  .handler(async ({ data }) => {
    const { findProductBySlug } = await import("@/server/catalog.server");
    return findProductBySlug(data.slug);
  });

export const fetchAllProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/server/auth.server");
  const { listAllProducts } = await import("@/server/catalog.server");
  await requireAdmin();
  return listAllProducts();
});

export const fetchProductCountByCategory = createServerFn({ method: "GET" }).handler(
  async () => {
    const { productCountsByCategory } = await import("@/server/catalog.server");
    return productCountsByCategory();
  },
);
