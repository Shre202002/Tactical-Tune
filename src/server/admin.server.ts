import { GridFSBucket, ObjectId } from "mongodb";

import type {
  AppRole,
  OrderStatus,
  ProductFaq,
  ProductImage,
  PromoRow,
  ProductRow,
  ProductSeo,
  ProductShipping,
  ProductSpec,
} from "@/lib/domain";
import {
  getAdminPermissions,
  getRoleLabel,
  getRoleRestrictions,
  STAFF_ROLES,
} from "@/lib/rbac";
import {
  requireAdmin,
  requireStaff,
  type UserDocument,
} from "./auth.server";
import {
  listAllProducts,
  listCategories,
  defaultProductAnalytics,
  defaultProductShipping,
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

type AuditLogDocument = {
  _id: ObjectId;
  actor_id: ObjectId;
  actor_email: string;
  actor_role: AppRole;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
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

function getUserFullName(user: Pick<UserDocument, "firstName" | "lastName" | "full_name">) {
  return (
    user.full_name ||
    [user.firstName, user.lastName]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(" ") ||
    null
  );
}

function getUserCreatedAt(user: Pick<UserDocument, "createdAt" | "created_at">) {
  return user.created_at ?? user.createdAt ?? new Date(0);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "product";
}

function sanitizeImageKitFolderSegment(value: string) {
  return (
    value
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90) || "folder"
  );
}

function sanitizeImageKitFolderPath(value: string) {
  const segments = value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map(sanitizeImageKitFolderSegment);
  return `/${segments.join("/")}`;
}

function imageKitConfig() {
  const privateKey =
    process.env.IMAGEKIT_PRIVATE_KEY ||
    process.env.Imagekit_PRIVATE_KEY ||
    process.env.IMAGEKIT_PRIVATE ||
    "";
  const urlEndpoint =
    process.env.IMAGEKIT_URL_ENDPOINT ||
    process.env["Imagekit_URL-endpoint"] ||
    process.env.IMAGEKIT_URL ||
    "";

  if (!privateKey) throw new Error("ImageKit private key is missing.");
  return { privateKey, urlEndpoint };
}

function imageKitFolder(productName: string, productSlug?: string) {
  const rootFolder = sanitizeImageKitFolderPath(
    process.env.IMAGEKIT_PRODUCT_FOLDER || "/Tactical-Tune/Products",
  );
  return `${rootFolder}/${slugify(productSlug || productName)}`;
}

function imageKitFileName(productName: string, imageIndex: number) {
  return `tacticaltune_best_Guns_${slugify(productName)}_${Math.max(1, imageIndex)}.webp`;
}

function normalizeProductImageInput(images: ProductImage[], productName: string) {
  return images.map((image, index) => ({
    ...image,
    alt: image.alt || productName,
    is_primary: index === 0,
    order: index,
    fileId: image.fileId ?? null,
    name: image.name ?? null,
    filePath: image.filePath ?? null,
    thumbnailUrl: image.thumbnailUrl ?? null,
  }));
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "hidden";
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  return phone.length <= 4 ? "****" : `******${phone.slice(-4)}`;
}

async function recordAdminAudit(
  actor: { id: string; email: string; role: AppRole },
  action: string,
  targetType: string,
  targetId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const logs = await getCollection<AuditLogDocument>("auditLogs");
  await logs.insertOne({
    _id: new ObjectId(),
    actor_id: new ObjectId(actor.id),
    actor_email: actor.email,
    actor_role: actor.role,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
    created_at: new Date(),
  });
}

export async function getAdminProducts() {
  await requireStaff();
  return listAllProducts();
}

export async function getAdminCategories() {
  await requireStaff();
  return listCategories({ includeInactive: true });
}

export async function saveProduct(input: ProductAdminInput): Promise<ProductRow> {
  const actor = await requireStaff();
  const [products, categories] = await Promise.all([
    getCollection<ProductDocument>("products"),
    getCollection<CategoryDocument>("categories"),
  ]);
  const now = new Date();
  const id = input.id && ObjectId.isValid(input.id) ? new ObjectId(input.id) : null;
  const existing = id ? await products.findOne({ _id: id }) : null;
  const category = input.category_slug
    ? await categories.findOne({ slug: input.category_slug })
    : null;
  const productName = input.name.trim();
  const productSlug = input.slug.trim().toLowerCase();
  const images = normalizeProductImageInput(
    input.images?.length ? input.images : existing?.images ?? [],
    productName,
  );
  const seo: ProductSeo = input.seo ?? {
    meta_title: existing?.seo?.meta_title ?? existing?.seo_title ?? productName,
    meta_description:
      existing?.seo?.meta_description ??
      existing?.seo_description ??
      input.short_description.trim(),
    meta_keywords: existing?.seo?.meta_keywords ?? input.tags ?? existing?.tags ?? [],
  };

  const document: Omit<ProductDocument, "_id" | "created_at"> = {
    __v: existing?.__v ?? 0,
    name: productName,
    slug: productSlug,
    brand: input.brand.trim() || null,
    short_description: input.short_description.trim() || null,
    description: input.description.trim() || null,
    sku: input.sku?.trim() || existing?.sku || productSlug.toUpperCase().slice(0, 48),
    currency: existing?.currency ?? "INR",
    price: Math.max(0, Number(input.price)),
    compare_at_price:
      input.compare_at_price == null ? null : Math.max(0, Number(input.compare_at_price)),
    category_id: category?._id ?? existing?.category_id ?? null,
    category_slug: input.category_slug || null,
    sub_category: existing?.sub_category ?? null,
    tags: input.tags ?? existing?.tags ?? [],
    images,
    analytics: existing?.analytics ?? defaultProductAnalytics(),
    faqs: input.faqs ?? existing?.faqs ?? [],
    stock: Math.max(0, Math.floor(input.stock)),
    low_stock_threshold: existing?.low_stock_threshold ?? 3,
    track_inventory: input.track_inventory ?? existing?.track_inventory ?? true,
    is_active: input.is_active,
    is_deleted: existing?.is_deleted ?? false,
    is_featured: input.is_featured,
    licence_required: input.licence_required,
    requiresHandling: input.requiresHandling ?? existing?.requiresHandling ?? false,
    requiresPremiumProtection:
      input.requiresPremiumProtection ?? existing?.requiresPremiumProtection ?? false,
    power_plant: input.power_plant.trim() || null,
    caliber: input.caliber.trim() || null,
    velocity: input.velocity.trim() || null,
    specifications: input.specifications ?? existing?.specifications ?? [],
    seo,
    seo_title: seo.meta_title,
    seo_description: seo.meta_description,
    shipping: input.shipping ?? existing?.shipping ?? defaultProductShipping(),
    visibility_priority: input.visibility_priority ?? existing?.visibility_priority ?? 0,
    created_by_admin: existing?.created_by_admin ?? actor.email,
    updated_by_admin: actor.email,
    createdAt: existing?.createdAt ?? existing?.created_at ?? now,
    updatedAt: now,
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
    await recordAdminAudit(actor, "product.update", "product", result._id.toHexString(), {
      name: result.name,
      stock: result.stock,
      is_active: result.is_active,
    });
    return serializeProduct(result);
  }

  const created: ProductDocument = {
    _id: new ObjectId(),
    ...document,
    created_at: now,
  };
  await products.insertOne(created);
  await recordAdminAudit(actor, "product.create", "product", created._id.toHexString(), {
    name: created.name,
    stock: created.stock,
    is_active: created.is_active,
  });
  return serializeProduct(created);
}

export async function deleteProduct(productId: string) {
  const actor = await requireAdmin();
  if (!ObjectId.isValid(productId)) throw new Error("Invalid product.");
  const products = await getCollection<ProductDocument>("products");
  const product = await products.findOne({ _id: new ObjectId(productId) });
  await products.deleteOne({ _id: new ObjectId(productId) });
  await recordAdminAudit(actor, "product.delete", "product", productId, {
    name: product?.name ?? null,
  });
}

export async function saveCategory(input: CategoryAdminInput) {
  const actor = await requireAdmin();
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
    await recordAdminAudit(actor, "category.update", "category", result._id.toHexString(), {
      name: result.name,
      slug: result.slug,
    });
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
  await recordAdminAudit(actor, "category.create", "category", created._id.toHexString(), {
    name: created.name,
    slug: created.slug,
  });
  return serializeCategory(created);
}

export async function deleteCategory(categoryId: string) {
  const actor = await requireAdmin();
  if (!ObjectId.isValid(categoryId)) throw new Error("Invalid category.");
  const categories = await getCollection<CategoryDocument>("categories");
  const category = await categories.findOne({ _id: new ObjectId(categoryId) });
  await categories.deleteOne({ _id: new ObjectId(categoryId) });
  await recordAdminAudit(actor, "category.delete", "category", categoryId, {
    name: category?.name ?? null,
    slug: category?.slug ?? null,
  });
}

export async function getAdminPromos() {
  await requireAdmin();
  const promos = await getCollection<PromoDocument>("promos");
  return (await promos.find({}).sort({ created_at: -1 }).toArray()).map(serializePromo);
}

export async function savePromo(input: PromoAdminInput) {
  const actor = await requireAdmin();
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
    await recordAdminAudit(actor, "promo.update", "promo", result._id.toHexString(), {
      code: result.code,
      is_active: result.is_active,
    });
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
  await recordAdminAudit(actor, "promo.create", "promo", created._id.toHexString(), {
    code: created.code,
    is_active: created.is_active,
  });
  return serializePromo(created);
}

export async function deletePromo(promoId: string) {
  const actor = await requireAdmin();
  if (!ObjectId.isValid(promoId)) throw new Error("Invalid promo.");
  const promos = await getCollection<PromoDocument>("promos");
  const promo = await promos.findOne({ _id: new ObjectId(promoId) });
  await promos.deleteOne({ _id: new ObjectId(promoId) });
  await recordAdminAudit(actor, "promo.delete", "promo", promoId, {
    code: promo?.code ?? null,
  });
}

export async function getAdminOrders(filter: OrderStatus | "all") {
  await requireStaff();
  const orders = await getCollection<OrderDocument>("orders");
  const query = filter === "all" ? {} : { status: filter };
  const rows = await orders.find(query).sort({ created_at: -1 }).toArray();
  if (rows.length === 0) return [];

  const users = await getCollection<UserDocument>("users");
  const userRows = await users
    .find({ _id: { $in: [...new Set(rows.map((row) => row.user_id.toHexString()))].map((id) => new ObjectId(id)) } })
    .project<{
      _id: ObjectId;
      email: string;
      firstName?: string;
      lastName?: string;
      full_name?: string | null;
    }>({
      email: 1,
      firstName: 1,
      lastName: 1,
      full_name: 1,
    })
    .toArray();
  const userMap = new Map(userRows.map((user) => [user._id.toHexString(), user]));

  return rows.map((order) => ({
    ...serializeOrder(order),
    customer: userMap.has(order.user_id.toHexString())
      ? {
          email: userMap.get(order.user_id.toHexString())?.email ?? "",
          full_name: getUserFullName(userMap.get(order.user_id.toHexString())!),
        }
      : null,
  }));
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
}) {
  const actor = await requireStaff();
  if (actor.role === "shop_manager" && input.status !== "fulfilled") {
    throw new Error("Shop managers can only mark orders as fulfilled.");
  }
  if (!ObjectId.isValid(input.orderId)) throw new Error("Invalid order.");
  const orders = await getCollection<OrderDocument>("orders");
  const now = new Date();
  const existing = await orders.findOne({ _id: new ObjectId(input.orderId) });
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
  await recordAdminAudit(actor, "order.status_update", "order", input.orderId, {
    from: existing?.status ?? null,
    to: input.status,
    order_number: existing?.order_number ?? null,
  });
}

export async function getAdminDashboard() {
  const actor = await requireStaff();
  const permissions = getAdminPermissions(actor.role);
  const [products, orders, carts, users, promos] = await Promise.all([
    getCollection<ProductDocument>("products"),
    getCollection<OrderDocument>("orders"),
    getCollection<CartDocument>("carts"),
    getCollection<UserDocument>("users"),
    getCollection<PromoDocument>("promos"),
  ]);
  const [
    productCount,
    lowStockCount,
    orderRows,
    activeCarts,
    customerCount,
    staffCount,
    promoCount,
  ] = await Promise.all([
    products.countDocuments(),
    products.countDocuments({ stock: { $lte: 3 } }),
    orders.find({}).project<{ status: OrderStatus; total: number }>({ status: 1, total: 1 }).toArray(),
    carts.find({ status: "active" }).toArray(),
    users.countDocuments({ role: "customer" }),
    users.countDocuments({ role: { $in: [...STAFF_ROLES] } }),
    promos.countDocuments(),
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
  const recentAuditLogs = permissions.canViewAuditLogs
    ? (
        await (await getCollection<AuditLogDocument>("auditLogs"))
          .find({})
          .sort({ created_at: -1 })
          .limit(5)
          .toArray()
      ).map((log) => ({
        id: log._id.toHexString(),
        actor_email: log.actor_email,
        actor_role: log.actor_role,
        action: log.action,
        target_type: log.target_type,
        target_id: log.target_id,
        created_at: log.created_at.toISOString(),
      }))
    : [];

  return {
    role: actor.role,
    roleLabel: getRoleLabel(actor.role),
    permissions,
    restrictions: getRoleRestrictions(actor.role),
    productCount,
    lowStockCount,
    orderCount: orderRows.length,
    customerCount,
    staffCount,
    promoCount,
    byStatus,
    abandonedCount,
    activeCartCount: activeCarts.length,
    totalRevenue: Object.entries(byStatus)
      .filter(([status]) => status === "paid" || status === "fulfilled")
      .reduce((sum, [, value]) => sum + value.total, 0),
    recentAuditLogs,
  };
}

export async function getCustomers() {
  const actor = await requireStaff();
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
    email: actor.role === "shop_manager" ? maskEmail(user.email) : user.email,
    full_name: getUserFullName(user),
    phone: actor.role === "shop_manager" ? maskPhone(user.phone) : user.phone,
    role: user.role as AppRole,
    created_at: getUserCreatedAt(user).toISOString(),
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
  productName: string;
  productSlug?: string;
  imageIndex: number;
}) {
  const actor = await requireStaff();
  if (input.mimeType !== "image/webp") {
    throw new Error("Product images must be converted to WebP before upload.");
  }
  const buffer = Buffer.from(input.base64, "base64");
  if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
    throw new Error("Image must be smaller than 10 MB.");
  }

  const { privateKey } = imageKitConfig();
  const folder = imageKitFolder(input.productName, input.productSlug);
  const fileName = imageKitFileName(input.productName, input.imageIndex);
  const form = new FormData();
  form.set("file", new Blob([buffer], { type: "image/webp" }), fileName);
  form.set("fileName", fileName);
  form.set("folder", folder);
  form.set("useUniqueFileName", "false");
  form.set("overwriteFile", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
    body: form,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ImageKit upload failed: ${message.slice(0, 220)}`);
  }

  const upload = (await response.json()) as {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    filePath?: string;
  };
  const image: ProductImage = {
    url: upload.url,
    alt: input.productName,
    is_primary: input.imageIndex === 1,
    order: Math.max(0, input.imageIndex - 1),
    fileId: upload.fileId,
    name: upload.name,
    filePath: upload.filePath ?? `${folder}/${fileName}`,
    thumbnailUrl: upload.thumbnailUrl ?? null,
  };

  await recordAdminAudit(actor, "product.image_upload", "product_image", upload.fileId, {
    filename: fileName,
    folder,
    bytes: buffer.length,
    source_filename: input.filename,
  });
  return image;
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
