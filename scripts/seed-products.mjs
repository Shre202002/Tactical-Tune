/**
 * scripts/seed-products.mjs
 * Run: node --env-file=.env.local scripts/seed-products.mjs
 *
 * Inserts sample featured products so the storefront has visible content.
 * Safe to re-run — uses upsert on slug so it will not create duplicates.
 */

import { MongoClient, ObjectId } from "mongodb";

const databaseName = process.env.MONGODB_DATABASE || "tactical_hub";

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (!process.env.db_user || !process.env.db_password)
    throw new Error("Set MONGODB_URI or db_user and db_password.");
  return `mongodb+srv://${encodeURIComponent(process.env.db_user)}:${encodeURIComponent(process.env.db_password)}@cluster1.a8ttkac.mongodb.net/?appName=Cluster1`;
}

const defaultAnalytics = {
  average_rating: 4.7,
  cart_add_count: 0,
  review_count: 0,
  share_count: 0,
  total_orders: 0,
  total_views: 0,
  wishlist_count: 0,
};

const defaultShipping = {
  weight_kg: 1.2,
  shape: "box",
  package_dimensions_cm: { diameter: null, height: 30, length: 40, width: 20 },
};

const now = new Date();

const IMG_BASE = "https://images.unsplash.com";

const products = [
  {
    name: "Reaper M1 CO2 Air Rifle",
    slug: "reaper-m1-co2-air-rifle",
    brand: "TacticalTune",
    sku: "TT-RM1-CO2",
    short_description: "Semi-auto CO2 powered air rifle with precision rifled barrel.",
    description: "The Reaper M1 delivers match-grade accuracy in a rugged tactical platform. Powered by dual 12g CO2 capsules, it cycles up to 18 rounds of .177 BBs at 450 fps.",
    price: 8999,
    compare_at_price: 11499,
    stock: 24,
    category_slug: "air-rifles",
    caliber: ".177",
    power_plant: "CO2",
    velocity: "450 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["co2", "air-rifle", "semi-auto", "tactical"],
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80",
    imageAlt: "Reaper M1 CO2 Air Rifle",
  },
  {
    name: "Phantom PCP Precision Rifle",
    slug: "phantom-pcp-precision-rifle",
    brand: "TacticalTune",
    sku: "TT-PH1-PCP",
    short_description: "PCP-powered long-range precision shooter for competitive marksmen.",
    description: "The Phantom PCP is engineered for operators who demand sub-MOA accuracy beyond 50 metres. Its regulated 200cc air cylinder maintains a consistent 3000 psi charge.",
    price: 24999,
    compare_at_price: 29999,
    stock: 8,
    category_slug: "air-rifles",
    caliber: ".22",
    power_plant: "PCP",
    velocity: "900 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["pcp", "precision", "long-range", "competition"],
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
    imageAlt: "Phantom PCP Precision Rifle",
  },
  {
    name: "Viper Spring-Piston Carbine",
    slug: "viper-spring-piston-carbine",
    brand: "TacticalTune",
    sku: "TT-VP1-SPR",
    short_description: "Single-cock spring-piston carbine — no gas, no hassle.",
    description: "The Viper carbine is the perfect entry-level precision rifle. A single under-lever cock charges its nitro-piston cylinder, delivering a smooth shot cycle.",
    price: 5499,
    compare_at_price: null,
    stock: 3,
    category_slug: "air-rifles",
    caliber: ".177",
    power_plant: "Spring Piston",
    velocity: "650 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["spring", "carbine", "beginner", "value"],
    imageUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80",
    imageAlt: "Viper Spring-Piston Carbine",
  },
  {
    name: "Wraith HPA Bullpup",
    slug: "wraith-hpa-bullpup",
    brand: "TacticalTune",
    sku: "TT-WR1-HPA",
    short_description: "Compact HPA bullpup with side-fill and adjustable power.",
    description: "The Wraith HPA Bullpup packs a 480cc side-fill HPA bottle into a 680mm overall length. Its 3-power adjustment wheel lets you dial from 12 ft-lb to 30 ft-lb.",
    price: 34999,
    compare_at_price: 39999,
    stock: 5,
    category_slug: "air-rifles",
    caliber: ".25",
    power_plant: "HPA",
    velocity: "850 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["hpa", "bullpup", "adjustable", "hunting"],
    imageUrl: "https://images.unsplash.com/photo-1633248654993-3e7e1e3a4bf8?w=800&q=80",
    imageAlt: "Wraith HPA Bullpup",
  },
  {
    name: "Titan Tactical BB Pistol",
    slug: "titan-tactical-bb-pistol",
    brand: "TacticalTune",
    sku: "TT-TT1-CO2",
    short_description: "Full-metal 19-round semi-auto BB pistol for training and competition.",
    description: "The Titan Tactical is a 1:1 scale training pistol with a 19-round drop-free magazine and blowback slide for realistic recoil training.",
    price: 4299,
    compare_at_price: 5499,
    stock: 42,
    category_slug: "pistols",
    caliber: ".177 BB",
    power_plant: "CO2",
    velocity: "350 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["pistol", "co2", "blowback", "training"],
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=800&q=80",
    imageAlt: "Titan Tactical BB Pistol",
  },
  {
    name: "Eclipse Pellet Pistol",
    slug: "eclipse-pellet-pistol",
    brand: "TacticalTune",
    sku: "TT-EP1-CO2",
    short_description: "8-shot rotary pellet pistol for precision short-range drills.",
    description: "The Eclipse fires .22 pellets through a 6-inch rifled steel barrel with an 8-shot rotary magazine. Expect 120+ shots per CO2 cartridge.",
    price: 3799,
    compare_at_price: null,
    stock: 18,
    category_slug: "pistols",
    caliber: ".22",
    power_plant: "CO2",
    velocity: "380 fps",
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["pellet-pistol", "co2", "precision", "target"],
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
    imageAlt: "Eclipse Pellet Pistol",
  },
  {
    name: "Storm 4x32 Tactical Scope",
    slug: "storm-4x32-tactical-scope",
    brand: "TacticalTune",
    sku: "TT-SC1-4X32",
    short_description: "Mil-dot reticle 4x32 scope with multi-coated lenses.",
    description: "The Storm scope features fully multi-coated optics and a mil-dot reticle with 1/4 MOA click adjustments. Nitrogen-purged for fog and waterproof performance.",
    price: 2499,
    compare_at_price: 3199,
    stock: 67,
    category_slug: "accessories",
    caliber: null,
    power_plant: null,
    velocity: null,
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["scope", "optics", "accessories", "mil-dot"],
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    imageAlt: "Storm 4x32 Tactical Scope",
  },
  {
    name: "Guardian Trigger Upgrade Kit",
    slug: "guardian-trigger-upgrade-kit",
    brand: "TacticalTune",
    sku: "TT-TK1-GRD",
    short_description: "Drop-in 2-stage trigger kit for most spring-piston rifles.",
    description: "The Guardian trigger kit reduces first-stage take-up to 1mm with a crisp 400g second stage. Precision machined from 6061 aluminium.",
    price: 1299,
    compare_at_price: null,
    stock: 29,
    category_slug: "accessories",
    caliber: null,
    power_plant: null,
    velocity: null,
    licence_required: false,
    is_featured: true,
    is_active: true,
    tags: ["trigger", "upgrade", "accessories", "spring"],
    imageUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80",
    imageAlt: "Guardian Trigger Upgrade Kit",
  },
];

const client = new MongoClient(mongoUri());

try {
  await client.connect();
  console.log("Connected to MongoDB:", databaseName);
  const db = client.db(databaseName);
  const productsCol = db.collection("products");

  await productsCol.createIndex({ slug: 1 }, { unique: true });
  await productsCol.createIndex({ is_featured: 1, is_active: 1 });

  let inserted = 0;
  let updated = 0;

  for (const p of products) {
    const seo = {
      meta_title: `${p.name} | TacticalTune`,
      meta_description: p.short_description,
      meta_keywords: p.tags,
    };

    const doc = {
      __v: 0,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      short_description: p.short_description,
      description: p.description,
      sku: p.sku,
      currency: "INR",
      price: p.price,
      compare_at_price: p.compare_at_price ?? null,
      category_slug: p.category_slug,
      sub_category: null,
      tags: p.tags,
      images: [
        {
          url: p.imageUrl,
          alt: p.imageAlt,
          is_primary: true,
          order: 0,
          fileId: null,
          name: null,
          filePath: null,
          thumbnailUrl: null,
        },
      ],
      analytics: defaultAnalytics,
      faqs: [],
      stock: p.stock,
      low_stock_threshold: 3,
      track_inventory: true,
      is_active: p.is_active,
      is_deleted: false,
      is_featured: p.is_featured,
      licence_required: p.licence_required,
      requiresHandling: false,
      requiresPremiumProtection: false,
      power_plant: p.power_plant ?? null,
      caliber: p.caliber ?? null,
      velocity: p.velocity ?? null,
      specifications: [],
      seo,
      seo_title: seo.meta_title,
      seo_description: seo.meta_description,
      shipping: defaultShipping,
      visibility_priority: 0,
      created_by_admin: "seed",
      updated_by_admin: "seed",
      updatedAt: now,
      updated_at: now,
    };

    const result = await productsCol.updateOne(
      { slug: p.slug },
      {
        $set: doc,
        $setOnInsert: {
          _id: new ObjectId(),
          category_id: null,
          createdAt: now,
          created_at: now,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      inserted++;
      console.log(`  Inserted: ${p.name}`);
    } else if (result.modifiedCount > 0) {
      updated++;
      console.log(`  Updated:  ${p.name}`);
    } else {
      console.log(`  Skipped:  ${p.name} (no changes)`);
    }
  }

  console.log(`\nDone! ${inserted} inserted, ${updated} updated out of ${products.length} products.`);
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
