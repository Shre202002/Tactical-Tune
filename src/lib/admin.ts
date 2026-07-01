"use server";

import type {
  OrderStatus,
  ProductFaq,
  ProductImage,
  ProductSeo,
  ProductShipping,
  ProductSpec,
} from "./domain";

export async function fetchAdminProducts() {
  const { getAdminProducts } = await import("@/server/admin.server");
  return getAdminProducts();
}

export async function saveAdminProduct(input: {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  short_description: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  category_slug: string;
  caliber: string;
  power_plant: string;
  velocity: string;
  is_featured: boolean;
  is_active: boolean;
  licence_required: boolean;
  images: ProductImage[];
  sku?: string;
  tags?: string[];
  specifications?: ProductSpec[];
  faqs?: ProductFaq[];
  seo?: ProductSeo;
  shipping?: ProductShipping;
  track_inventory?: boolean;
  requiresHandling?: boolean;
  requiresPremiumProtection?: boolean;
  visibility_priority?: number;
}) {
  const { saveProduct } = await import("@/server/admin.server");
  return saveProduct(input);
}

export async function deleteAdminProduct(id: string) {
  const { deleteProduct } = await import("@/server/admin.server");
  await deleteProduct(id);
  return { success: true };
}

export async function fetchAdminCategories() {
  const { getAdminCategories } = await import("@/server/admin.server");
  return getAdminCategories();
}

export async function saveAdminCategory(input: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}) {
  const { saveCategory } = await import("@/server/admin.server");
  return saveCategory(input);
}

export async function deleteAdminCategory(id: string) {
  const { deleteCategory } = await import("@/server/admin.server");
  await deleteCategory(id);
  return { success: true };
}

export async function fetchAdminPromos() {
  const { getAdminPromos } = await import("@/server/admin.server");
  return getAdminPromos();
}

export async function saveAdminPromo(input: {
  id?: string;
  code: string;
  description: string;
  percent_off: number | null;
  flat_off: number | null;
  min_order_amount: number;
  max_uses: number | null;
  is_active: boolean;
}) {
  const { savePromo } = await import("@/server/admin.server");
  return savePromo(input);
}

export async function deleteAdminPromo(id: string) {
  const { deletePromo } = await import("@/server/admin.server");
  await deletePromo(id);
  return { success: true };
}

export async function fetchAdminOrders(filter: OrderStatus | "all") {
  const { getAdminOrders } = await import("@/server/admin.server");
  return getAdminOrders(filter);
}

export async function setAdminOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
}) {
  const { updateOrderStatus } = await import("@/server/admin.server");
  await updateOrderStatus(input);
  return { success: true };
}

export async function fetchAdminDashboard() {
  const { getAdminDashboard } = await import("@/server/admin.server");
  return getAdminDashboard();
}

export async function fetchCustomers() {
  const { getCustomers } = await import("@/server/admin.server");
  return getCustomers();
}

export async function uploadProductImage(input: {
  filename: string;
  mimeType: string;
  base64: string;
  productName: string;
  productSlug?: string;
  imageIndex: number;
}) {
  const { uploadImage } = await import("@/server/admin.server");
  return uploadImage(input);
}
