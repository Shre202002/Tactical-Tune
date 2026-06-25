import { Readable } from "node:stream";
import { GridFSBucket, ObjectId } from "mongodb";

import type {
  AppRole,
  OrderStatus,
  PromoRow,
  ProductRow,
} from "@/lib/domain";
import {
  requireAdmin,
  requireSuperAdmin,
  type UserDocument,
} from "./auth.server";
import {
  listAllProducts,
  listCategories,
  serializeCategory,
  serializeProduct,
  type CategoryDocument,
  type ProductDocument,
} from "./catalog.server";
import { getCollection, getDatabase } from "./database.server";
import {
  serializeOrder,
  type CartDocument,
  type OrderDocument,
} from "./store.server";

export type ProductAdminInput = {
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
  image_url: string;
};

export type CategoryAdminInput = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export type PromoAdminInput = {
  id?: string;
  code: string;
  description: string;
  percent_off: number | null;
  flat_off: number | null;
  min_order_amount: number;
  max_uses: number | null;
  is_active: boolean;
};

type PromoDocument = Omit<PromoRow, "id" | "created_at" | "updated_at"> & {
  _id: ObjectId;
  created_at: Date;
  updated_at: Date;
};

function serializePromo(promo: PromoDocument): PromoRow {
  return {
    id: promo._id.toHexString(),
    code: promo.code,
    description: promo.description,
    percent_off: promo.percent_off,
    flat_off: promo.flat_off,
    min_order_amount: Number(promo.min_order_amount),
    max_uses: promo.max_uses,
    uses_count: promo.uses_count,
    valid_from: promo.valid_from,
    valid_to: promo.valid_to,
    is_active: promo.is_active,
    created_at: promo.created_at.toISOString(),
    updated_at: promo.updated_at.toISOString(),
  };
}

export async function getAdminProducts() {
  await requireAdmin();
  return listAllProducts();
}

export async function getAdminCategories() {
  await requireAdmin();
  return listCategories({ includeInactive: true });
}

export async function saveProduct(input: ProductAdminInput): Promise<ProductRow> {
  await requireAdmin();
  const products = await getCollection<ProductDocument>("products");
  const now = new Date();
  const id = input.id && ObjectId.isValid(input.id) ? new ObjectId(input.id) : null;
  const existing = id ? await products.findOne({ _id: id }) : null;

  const document: Omit<ProductDocument, "_id" | "created_at"> = {
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    brand: input.brand.trim() || null,
    short_description: input.short_description.trim() || null,
    description: input.description.trim() || null,
    sku: existing?.sku ?? null,
    price: Math.max(0, Number(input.price)),
    compare_at_price:
      input.compare_at_price == null ? null : Math.max(0, Number(input.compare_at_price)),
    category_slug: input.category_slug || null,
    sub_category: existing?.sub_category ?? null,
    tags: existing?.tags ?? [],
    images: input.image_url
      ? [{ url: input.image_url, alt: input.name.trim(), order: 0 }]
      : existing?.images ?? [],
    stock: Math.max(0, Math.floor(input.stock)),
    low_stock_threshold: existing?.low_stock_threshold ?? 3,
    is_active: input.is_active,
    is_featured: input.is_featured,
    licence_required: input.licence_required,
    power_plant: input.power_plant.trim() || null,
    caliber: input.caliber.trim() || null,
    velocity: input.velocity.trim() || null,
    specifications: existing?.specifications ?? [],
    seo_title: existing?.seo_title ?? null,
    seo_description: existing?.seo_description ?? null,
    updated_at: now,
  };

  if (!document.name || !document.slug) throw new Error("Name and slug are required.");

  if (id) {
    const result = await products.findOneAndUpdate(
      { _id: id },
      { $set: document },
      { returnDocument: "after" },
    );
    if (!result) throw new Error("Product not found.");
    return serializeProduct(result);
  }

  const created: ProductDocument = {
    _id: new ObjectId(),
    ...document,
    created_at: now,
  };
  await products.insertOne(created);
  return serializeProduct(created);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(productId)) throw new Error("Invalid product.");
  const products = await getCollection<ProductDocument>("products");
  await products.deleteOne({ _id: new ObjectId(productId) });
}

export async function saveCategory(input: CategoryAdminInput) {
  await requireAdmin();
  const categories = await getCollection<CategoryDocument>("categories");
  const now = new Date();
  const id = input.id && ObjectId.isValid(input.id) ? new ObjectId(input.id) : null;
  const values = {
    name: input.name.trim(),
    slug: input.slug.trim().toLowerCase(),
    description: input.description.trim() || null,
    sort_order: Math.floor(input.sort_order),
    updated_at: now,
  };
  if (!values.name || !values.slug) throw new Error("Name and slug are required.");

  if (id) {
    const result = await categories.findOneAndUpdate(
      { _id: id },
      { $set: values },
      { returnDocument: "after" },
    );
    if (!result) throw new Error("Category not found.");
    return serializeCategory(result);
  }

  const created: CategoryDocument = {
    _id: new ObjectId(),
    ...values,
    image: null,
    is_active: true,
    created_at: now,
  };
  await categories.insertOne(created);
  return serializeCategory(created);
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(categoryId)) throw new Error("Invalid category.");
  const categories = await getCollection<CategoryDocument>("categories");
  await categories.deleteOne({ _id: new ObjectId(categoryId) });
}

export async function getAdminPromos() {
  await requireAdmin();
  const promos = await getCollection<PromoDocument>("promos");
  return (await promos.find({}).sort({ created_at: -1 }).toArray()).map(serializePromo);
}

export async function savePromo(input: PromoAdminInput) {
  await requireAdmin();
  const promos = await getCollection<PromoDocument>("promos");
  const now = new Date();
  const id = input.id && ObjectId.isValid(input.id) ? new ObjectId(input.id) : null;
  const values = {
    code: input.code.trim().toUpperCase(),
    description: input.description.trim() || null,
    percent_off: input.percent_off,
    flat_off: input.flat_off,
    min_order_amount: Math.max(0, Number(input.min_order_amount)),
    max_uses: input.max_uses,
    is_active: input.is_active,
    updated_at: now,
  };
  if (!values.code) throw new Error("Promo code is required.");
  if (values.percent_off == null && values.flat_off == null) {
    throw new Error("Set a percentage or flat discount.");
  }

  if (id) {
    const result = await promos.findOneAndUpdate(
      { _id: id },
      { $set: values },
      { returnDocument: "after" },
    );
    if (!result) throw new Error("Promo not found.");
    return serializePromo(result);
  }

  const created: PromoDocument = {
    _id: new ObjectId(),
    ...values,
    uses_count: 0,
    valid_from: null,
    valid_to: null,
    created_at: now,
  };
  await promos.insertOne(created);
  return serializePromo(created);
}

export async function deletePromo(promoId: string) {
  await requireAdmin();
  if (!ObjectId.isValid(promoId)) throw new Error("Invalid promo.");
  const promos = await getCollection<PromoDocument>("promos");
  await promos.deleteOne({ _id: new ObjectId(promoId) });
}

export async function getAdminOrders(filter: OrderStatus | "all") {
  await requireAdmin();
  const orders = await getCollection<OrderDocument>("orders");
  const query = filter === "all" ? {} : { status: filter };
  const rows = await orders.find(query).sort({ created_at: -1 }).toArray();
  if (rows.length === 0) return [];

  const users = await getCollection<UserDocument>("users");
  const userRows = await users
    .find({ _id: { $in: [...new Set(rows.map((row) => row.user_id.toHexString()))].map((id) => new ObjectId(id)) } })
    .project<{ _id: ObjectId; email: string; full_name: string | null }>({
      email: 1,
      full_name: 1,
    })
    .toArray();
  const userMap = new Map(userRows.map((user) => [user._id.toHexString(), user]));

  return rows.map((order) => ({
    ...serializeOrder(order),
    customer: userMap.has(order.user_id.toHexString())
      ? {
          email: userMap.get(order.user_id.toHexString())?.email ?? "",
          full_name: userMap.get(order.user_id.toHexString())?.full_name ?? null,
        }
      : null,
  }));
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
}) {
  await requireAdmin();
  if (!ObjectId.isValid(input.orderId)) throw new Error("Invalid order.");
  const orders = await getCollection<OrderDocument>("orders");
  const now = new Date();
  await orders.updateOne(
    { _id: new ObjectId(input.orderId) },
    {
      $set: {
        status: input.status,
        payment_completed_at: input.status === "paid" ? now : null,
        updated_at: now,
      },
    },
  );
}

export async function getAdminDashboard() {
  await requireAdmin();
  const [products, orders, carts] = await Promise.all([
    getCollection<ProductDocument>("products"),
    getCollection<OrderDocument>("orders"),
    getCollection<CartDocument>("carts"),
  ]);
  const [productCount, orderRows, activeCarts] = await Promise.all([
    products.countDocuments(),
    orders.find({}).project<{ status: OrderStatus; total: number }>({ status: 1, total: 1 }).toArray(),
    carts.find({ status: "active" }).toArray(),
  ]);

  const byStatus: Record<string, { count: number; total: number }> = {};
  for (const order of orderRows) {
    byStatus[order.status] ??= { count: 0, total: 0 };
    byStatus[order.status].count += 1;
    byStatus[order.status].total += Number(order.total);
  }
  const cutoff = Date.now() - 60 * 60 * 1000;
  const abandonedCount = activeCarts.filter(
    (cart) => cart.items.length > 0 && cart.updated_at.getTime() < cutoff,
  ).length;

  return {
    productCount,
    byStatus,
    abandonedCount,
    activeCartCount: activeCarts.length,
    totalRevenue: Object.entries(byStatus)
      .filter(([status]) => status === "paid" || status === "fulfilled")
      .reduce((sum, [, value]) => sum + value.total, 0),
  };
}

export async function getCustomers() {
  await requireSuperAdmin();
  const [users, orders, carts] = await Promise.all([
    getCollection<UserDocument>("users"),
    getCollection<OrderDocument>("orders"),
    getCollection<CartDocument>("carts"),
  ]);
  const [userRows, orderRows, cartRows] = await Promise.all([
    users.find({}).sort({ created_at: -1 }).toArray(),
    orders.find({}).toArray(),
    carts.find({ status: "active" }).toArray(),
  ]);

  const ordersByUser = new Map<
    string,
    { total: number; completed: number; pending: number; spent: number }
  >();
  for (const order of orderRows) {
    const key = order.user_id.toHexString();
    const summary = ordersByUser.get(key) ?? {
      total: 0,
      completed: 0,
      pending: 0,
      spent: 0,
    };
    summary.total += 1;
    if (order.status === "paid" || order.status === "fulfilled") {
      summary.completed += 1;
      summary.spent += Number(order.total);
    }
    if (order.status === "pending_payment") summary.pending += 1;
    ordersByUser.set(key, summary);
  }

  const cartsByUser = new Map(
    cartRows
      .filter((cart) => cart.items.length > 0)
      .map((cart) => [
        cart.user_id.toHexString(),
        { items: cart.items.length, updated: cart.updated_at.toISOString() },
      ]),
  );

  return userRows.map((user) => ({
    id: user._id.toHexString(),
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: user.role as AppRole,
    created_at: user.created_at.toISOString(),
    orders: ordersByUser.get(user._id.toHexString()) ?? {
      total: 0,
      completed: 0,
      pending: 0,
      spent: 0,
    },
    cart: cartsByUser.get(user._id.toHexString()) ?? null,
  }));
}

export async function uploadImage(input: {
  filename: string;
  mimeType: string;
  base64: string;
}) {
  await requireAdmin();
  if (!input.mimeType.startsWith("image/")) throw new Error("Only image files are allowed.");
  const buffer = Buffer.from(input.base64, "base64");
  if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName: "product_images" });
  const upload = bucket.openUploadStream(input.filename, {
    metadata: { content_type: input.mimeType, uploaded_at: new Date() },
  });
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer).pipe(upload).on("error", reject).on("finish", () => resolve());
  });
  return `/api/images/${upload.id.toHexString()}`;
}

export async function readImage(imageId: string) {
  if (!ObjectId.isValid(imageId)) return null;
  const database = await getDatabase();
  const bucket = new GridFSBucket(database, { bucketName: "product_images" });
  const file = await database
    .collection("product_images.files")
    .findOne({ _id: new ObjectId(imageId) });
  if (!file) return null;

  const chunks: Buffer[] = [];
  const stream = bucket.openDownloadStream(new ObjectId(imageId));
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return {
    bytes: Buffer.concat(chunks),
    contentType: String(file.metadata?.content_type || "application/octet-stream"),
  };
}
