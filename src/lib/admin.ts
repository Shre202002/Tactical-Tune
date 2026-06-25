import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderStatus = z.enum([
  "pending_payment",
  "paid",
  "failed",
  "cancelled",
  "fulfilled",
  "refunded",
]);

const productInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  brand: z.string(),
  short_description: z.string(),
  description: z.string(),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).nullable(),
  stock: z.number().int().min(0),
  category_slug: z.string(),
  caliber: z.string(),
  power_plant: z.string(),
  velocity: z.string(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  licence_required: z.boolean(),
  image_url: z.string(),
});

const categoryInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  sort_order: z.number().int(),
});

const promoInput = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  description: z.string(),
  percent_off: z.number().min(0).max(100).nullable(),
  flat_off: z.number().min(0).nullable(),
  min_order_amount: z.number().min(0),
  max_uses: z.number().int().min(1).nullable(),
  is_active: z.boolean(),
});

export type ProductAdminInput = z.infer<typeof productInput>;
export type CategoryAdminInput = z.infer<typeof categoryInput>;
export type PromoAdminInput = z.infer<typeof promoInput>;

export const fetchAdminProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminProducts } = await import("@/server/admin.server");
  return getAdminProducts();
});

export const saveAdminProduct = createServerFn({ method: "POST" })
  .validator(productInput)
  .handler(async ({ data }) => {
    const { saveProduct } = await import("@/server/admin.server");
    return saveProduct(data);
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { deleteProduct } = await import("@/server/admin.server");
    await deleteProduct(data.id);
    return { success: true };
  });

export const fetchAdminCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminCategories } = await import("@/server/admin.server");
  return getAdminCategories();
});

export const saveAdminCategory = createServerFn({ method: "POST" })
  .validator(categoryInput)
  .handler(async ({ data }) => {
    const { saveCategory } = await import("@/server/admin.server");
    return saveCategory(data);
  });

export const deleteAdminCategory = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { deleteCategory } = await import("@/server/admin.server");
    await deleteCategory(data.id);
    return { success: true };
  });

export const fetchAdminPromos = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminPromos } = await import("@/server/admin.server");
  return getAdminPromos();
});

export const saveAdminPromo = createServerFn({ method: "POST" })
  .validator(promoInput)
  .handler(async ({ data }) => {
    const { savePromo } = await import("@/server/admin.server");
    return savePromo(data);
  });

export const deleteAdminPromo = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { deletePromo } = await import("@/server/admin.server");
    await deletePromo(data.id);
    return { success: true };
  });

export const fetchAdminOrders = createServerFn({ method: "GET" })
  .validator(z.object({ filter: z.union([z.literal("all"), orderStatus]) }))
  .handler(async ({ data }) => {
    const { getAdminOrders } = await import("@/server/admin.server");
    return getAdminOrders(data.filter);
  });

export const setAdminOrderStatus = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.string().min(1), status: orderStatus }))
  .handler(async ({ data }) => {
    const { updateOrderStatus } = await import("@/server/admin.server");
    await updateOrderStatus(data);
    return { success: true };
  });

export const fetchAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminDashboard } = await import("@/server/admin.server");
  return getAdminDashboard();
});

export const fetchCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const { getCustomers } = await import("@/server/admin.server");
  return getCustomers();
});

export const uploadProductImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      filename: z.string().min(1).max(240),
      mimeType: z.string().min(1).max(120),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { uploadImage } = await import("@/server/admin.server");
    return uploadImage(data);
  });
