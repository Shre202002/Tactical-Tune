import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { MongoClient, ObjectId } from "mongodb";

const scrypt = promisify(scryptCallback);
const databaseName = process.env.MONGODB_DATABASE || "tactical_hub";

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (!process.env.db_user || !process.env.db_password) {
    throw new Error("Set MONGODB_URI or db_user and db_password.");
  }
  return `mongodb+srv://${encodeURIComponent(process.env.db_user)}:${encodeURIComponent(process.env.db_password)}@cluster1.a8ttkac.mongodb.net/?appName=Cluster1`;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derived).toString("hex")}`;
}

// Keep the initial catalog empty. Real categories and products should be added
// from the admin panel, not seeded as demo storefront content.
const categories = [];
const products = [];

const client = new MongoClient(mongoUri());

try {
  await client.connect();
  const db = client.db(databaseName);
  const now = new Date();

  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
    db.collection("categories").createIndex({ is_active: 1, sort_order: 1 }),
    db.collection("products").createIndex({ slug: 1 }, { unique: true }),
    db.collection("products").createIndex({ sku: 1 }, { unique: true, sparse: true }),
    db.collection("products").createIndex({ category_slug: 1, is_active: 1 }),
    db.collection("products").createIndex({ is_featured: 1, is_active: 1 }),
    db.collection("products").createIndex({ is_deleted: 1, visibility_priority: -1 }),
    db
      .collection("carts")
      .createIndex(
        { user_id: 1 },
        { unique: true, partialFilterExpression: { status: "active" } },
      ),
    db.collection("orders").createIndex({ order_number: 1 }, { unique: true }),
    db.collection("orders").createIndex({ user_id: 1, created_at: -1 }),
    db.collection("orders").createIndex({ status: 1, created_at: -1 }),
    db.collection("promos").createIndex({ code: 1 }, { unique: true }),
    db.collection("productReviews").createIndex({ product_id: 1, status: 1, createdAt: -1 }),
    db.collection("productReviews").createIndex({ user_id: 1, product_id: 1 }, { unique: true }),
    db.collection("productReviews").createIndex({ rating: 1 }),
    db.collection("auditLogs").createIndex({ created_at: -1 }),
    db.collection("auditLogs").createIndex({ actor_id: 1, created_at: -1 }),
    db.collection("auditLogs").createIndex({ target_type: 1, target_id: 1 }),
    db.collection("product_images.files").createIndex({ filename: 1, uploadDate: 1 }),
    db
      .collection("product_images.chunks")
      .createIndex({ files_id: 1, n: 1 }, { unique: true }),
  ]);

  for (const category of categories) {
    await db.collection("categories").updateOne(
      { slug: category.slug },
      {
        $set: { ...category, is_active: true, updated_at: now },
        $setOnInsert: { _id: new ObjectId(), created_at: now },
      },
      { upsert: true },
    );
  }

  for (const product of products) {
    const { image, ...productFields } = product;
    await db.collection("products").updateOne(
      { slug: product.slug },
      {
        $set: {
          ...productFields,
          images: [{ url: image, alt: product.name, is_primary: true, order: 0 }],
          analytics: {
            average_rating: 0,
            cart_add_count: 0,
            review_count: 0,
            share_count: 0,
            total_orders: 0,
            total_views: 0,
            wishlist_count: 0,
          },
          currency: "INR",
          faqs: [],
          is_deleted: false,
          requiresHandling: false,
          requiresPremiumProtection: false,
          seo: {
            meta_title: `${product.name} | TacticalTune`,
            meta_description: product.short_description,
            meta_keywords: product.tags,
          },
          shipping: {
            weight_kg: 0,
            shape: "box",
            package_dimensions_cm: {
              diameter: null,
              height: 0,
              length: null,
              width: null,
            },
          },
          track_inventory: true,
          low_stock_threshold: 3,
          is_active: true,
          licence_required: false,
          seo_title: `${product.name} | TacticalTune`,
          seo_description: product.short_description,
          visibility_priority: 0,
          updated_at: now,
          updatedAt: now,
        },
        $unset: { image: "" },
        $setOnInsert: {
          _id: new ObjectId(),
          __v: 0,
          category_id: null,
          created_by_admin: "seed",
          updated_by_admin: "seed",
          createdAt: now,
          created_at: now,
        },
      },
      { upsert: true },
    );
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
    const users = db.collection("users");
    const existing = await users.findOne({ email });
    if (!existing) {
      const id = new ObjectId();
      await users.insertOne({
        _id: id,
        __v: 0,
        email,
        emailVerified: false,
        firebaseId: `local:${id.toHexString()}`,
        firstName: "TacticalTune",
        lastName: "Administrator",
        password_hash: await hashPassword(process.env.SEED_ADMIN_PASSWORD),
        full_name: "TacticalTune Administrator",
        phone: "",
        phoneVerified: false,
        avatar_url: null,
        role: "super_admin",
        status: "active",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
        created_at: now,
        updated_at: now,
      });
    } else {
      await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            __v: typeof existing.__v === "number" ? existing.__v : 0,
            emailVerified: Boolean(existing.emailVerified),
            firebaseId: existing.firebaseId || `local:${existing._id.toHexString()}`,
            firstName: existing.firstName || "TacticalTune",
            lastName: existing.lastName || "Administrator",
            full_name: existing.full_name || "TacticalTune Administrator",
            phone: existing.phone || "",
            phoneVerified: Boolean(existing.phoneVerified),
            role: "super_admin",
            status: existing.status || "active",
            address: existing.address || "",
            landmark: existing.landmark || "",
            city: existing.city || "",
            state: existing.state || "",
            pincode: existing.pincode || "",
            lastLogin: existing.lastLogin || now,
            createdAt: existing.createdAt || existing.created_at || now,
            updatedAt: now,
            created_at: existing.created_at || existing.createdAt || now,
            updated_at: now,
          },
        },
      );
    }
  }

  console.log(`MongoDB initialized: ${databaseName}`);
  console.log("Collections: users, categories, products, carts, orders, promos, productReviews, auditLogs, product_images");
} finally {
  await client.close();
}
