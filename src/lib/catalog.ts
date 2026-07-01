"use server";


export async function fetchCategories() {
  const { listCategories } = await import("@/server/catalog.server");
  return listCategories();
}

export async function fetchFeaturedProducts(limit: number = 8) {
  const { listFeaturedProducts } = await import("@/server/catalog.server");
  return listFeaturedProducts(Math.min(Math.max(limit, 1), 24));
}

export async function fetchProductBySlug(slug: string) {
  const { findProductBySlug } = await import("@/server/catalog.server");
  return findProductBySlug(slug);
}

export async function fetchAllProducts() {
  const { requireStaff } = await import("@/server/auth.server");
  const { listAllProducts } = await import("@/server/catalog.server");
  await requireStaff();
  return listAllProducts();
}

export async function fetchActiveProducts(categorySlug?: string) {
  const { listActiveProducts } = await import("@/server/catalog.server");
  return listActiveProducts(categorySlug);
}

export async function fetchProductCountByCategory() {
  const { productCountsByCategory } = await import("@/server/catalog.server");
  return productCountsByCategory();
}
