/**
 * scripts/seed-real-products.mjs
 * Usage: node --env-file=.env.local scripts/seed-real-products.mjs
 *
 * 1. Deletes ALL existing products
 * 2. Inserts the 10 real Camstar products with full specifications
 * 3. Images temporarily use a placeholder — swap with ImageKit URLs later
 */

import { MongoClient, ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DATABASE || "tactical_hub";

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  throw new Error("MONGODB_URI is not set.");
}

const PLACEHOLDER =
  "https://ik.imagekit.io/ari07rsa2/Tactical-Tune/placeholder-product.webp";

const analytics = {
  average_rating: 0,
  cart_add_count: 0,
  review_count: 0,
  share_count: 0,
  total_orders: 0,
  total_views: 0,
  wishlist_count: 0,
};

const shipping = {
  weight_kg: 1.5,
  shape: "box",
  package_dimensions_cm: { diameter: null, height: 30, length: 40, width: 20 },
};

const now = new Date();

const products = [
  {
    name: "Star RX Gen 3",
    slug: "star-rx-gen-3",
    brand: "Camstar",
    sku: "CAM-STAR-RX-GEN3",
    price: 24500,
    stock: 15,
    category_slug: "pistols",
    caliber: '.177" (4.5mm)',
    power_plant: "CO2",
    velocity: "350 fps",
    is_featured: true,
    short_description:
      "Semi-automatic CO2 air pistol with 8-shot x4 magazines, 350 fps. No licence required.",
    description:
      "The Camstar Star RX Gen 3 is a premium semi-automatic CO2 air pistol designed for sport shooting and training. Featuring single and double action, 4 magazines of 8 shots each, and a 4.4 inch barrel for excellent accuracy.",
    specifications: [
      { key: "Caliber", value: '.177" (4.5mm)' },
      { key: "Action", value: "Single & Double Action, Semi-Auto" },
      { key: "Power Source", value: "CO2" },
      { key: "Power", value: "Up to 3 Joules" },
      { key: "Velocity", value: "350 fps" },
      { key: "Magazine", value: "8 shots x 4" },
      { key: "Barrel Length", value: '4.4"' },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
  },
  {
    name: "Precihole Sports NX200 Athena Karbin",
    slug: "precihole-nx200-athena-karbin",
    brand: "Precihole Sports",
    sku: "PRE-NX200-ATHENA",
    price: 13500,
    stock: 12,
    category_slug: "air-rifles",
    caliber: '0.177" (4.5mm)',
    power_plant: "Nitro Piston",
    velocity: "262 mps / 860 fps",
    is_featured: true,
    short_description:
      "Break barrel nitro piston air rifle, 860 fps, 3.15 kg. No licence required.",
    description:
      "The Precihole Sports NX200 Athena Karbin is a high-performance break-barrel air rifle powered by a nitro piston. Delivering up to 860 fps with a smooth, vibration-free shot cycle. Ideal for target shooting and pest control.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Break Barrel" },
      { key: "Power Source", value: "Nitro Piston" },
      { key: "Power", value: "Upto 20 Joules" },
      { key: "Velocity", value: "262 mps / 860 fps" },
      { key: "Total Weight", value: "3.15 kgs" },
      { key: "Barrel Length", value: "370mm" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "6 Months Manufacturer Warranty" },
    ],
  },
  {
    name: "Precihole Sports PX100 Achilles X3",
    slug: "precihole-px100-achilles-x3",
    brand: "Precihole Sports",
    sku: "PRE-PX100-ACHILLES",
    price: 36499,
    stock: 8,
    category_slug: "air-rifles",
    caliber: '0.177" (4.5mm)',
    power_plant: "PCP",
    velocity: "262 mps / 860 fps",
    is_featured: true,
    short_description:
      "PCP side-lever air rifle, integrated suppressor, 10-shot mag, 80 shots per fill.",
    description:
      "The Precihole Sports PX100 Achilles X3 is a premium PCP air rifle with a side-lever action, integrated suppressor for ultra-quiet operation, and a 10-shot magazine. Delivers 860 fps from its 500mm barrel with 80 shots per fill.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Side Lever" },
      { key: "Power Source", value: "PCP" },
      { key: "Power", value: "Upto 20 Joules" },
      { key: "Velocity", value: "262 mps / 860 fps" },
      { key: "Total Weight", value: "2.65 kgs" },
      { key: "Barrel Length", value: "500mm" },
      { key: "Suppressor", value: "Integrated Suppressor" },
      { key: "Magazine", value: "10 Shot Magazine" },
      { key: "Shots Per Fill", value: "80" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
  },
  {
    name: "Precihole Sports PP100 Harpy X3",
    slug: "precihole-pp100-harpy-x3",
    brand: "Precihole Sports",
    sku: "PRE-PP100-HARPY",
    price: 26499,
    stock: 10,
    category_slug: "pistols",
    caliber: '0.177" (4.5mm)',
    power_plant: "PCP",
    velocity: "243 mps / 800 fps",
    is_featured: true,
    short_description:
      "Compact PCP pistol, integrated suppressor, side-lever, 800 fps, 35 shots per fill.",
    description:
      "The Precihole Sports PP100 Harpy X3 is a compact PCP-powered air pistol with an integrated suppressor and side-lever action. Weighing just 1.15 kg with a 270mm barrel, it delivers 800 fps with 35 shots per fill.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Side Lever" },
      { key: "Power Source", value: "PCP" },
      { key: "Power", value: "Upto 16 Joules" },
      { key: "Velocity", value: "243 mps / 800 fps" },
      { key: "Total Weight", value: "1.15 kg" },
      { key: "Barrel Length", value: "270mm" },
      { key: "Suppressor", value: "Integrated Suppressor" },
      { key: "Magazine", value: "Yes with Pistol (MZ10 Included)" },
      { key: "Shots Per Fill", value: "35" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
  },
  {
    name: "Star PXi Suppressor With Combo",
    slug: "star-pxi-suppressor-combo",
    brand: "Camstar",
    sku: "CAM-STAR-PXI-COMBO",
    price: 29499,
    stock: 6,
    category_slug: "air-rifles",
    caliber: '0.177" (4.5mm)',
    power_plant: "PCP",
    velocity: "265 mps / 870 fps",
    is_featured: true,
    short_description:
      "PCP side-lever rifle, integrated suppressor, 2x10-shot mags, 870 fps, 90 shots per fill.",
    description:
      "The Star PXi Suppressor With Combo is a high-performance PCP air rifle with an integrated suppressor, side-lever action, and 2 x 10-shot magazines. Delivers 870 fps from a 480mm barrel with 90 shots per fill.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Side Lever" },
      { key: "Power Source", value: "PCP" },
      { key: "Power", value: "Up to 20 Joules" },
      { key: "Velocity", value: "265 mps / 870 fps" },
      { key: "Total Weight", value: "2.45 kg" },
      { key: "Barrel Length", value: "480mm" },
      { key: "Suppressor", value: "Integrated Suppressor" },
      { key: "Magazine", value: "10 Shot x 2 Magazines" },
      { key: "Shots Per Fill", value: "90" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
  },
  {
    name: "Crosman 1911 CO2 Pellet Pistol",
    slug: "crosman-1911-co2-pellet-pistol",
    brand: "Crosman",
    sku: "CRO-1911-CO2",
    price: 42000,
    stock: 5,
    category_slug: "pistols",
    caliber: '0.177" (4.5mm)',
    power_plant: "CO2",
    velocity: "480 fps",
    is_featured: false,
    short_description:
      "Classic 1911 CO2 pellet pistol, 480 fps, 12-shot BB, 861g. No licence required.",
    description:
      "The Crosman 1911 CO2 Pellet Pistol is a faithful recreation of the iconic M1911. Powered by CO2 at up to 480 fps with a 12-shot BB magazine. Full-metal body at 861g.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Semi-Auto" },
      { key: "Power Source", value: "CO2" },
      { key: "Power", value: "Up to 3 Joules" },
      { key: "Velocity", value: "480 fps" },
      { key: "Total Weight", value: "861 Grams" },
      { key: "Barrel Length", value: "480mm" },
      { key: "Magazine", value: "12 Shot BB" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "No Warranty" },
    ],
  },
  {
    name: "Crosman SNR357 CO2 Revolver",
    slug: "crosman-snr357-co2-revolver",
    brand: "Crosman",
    sku: "CRO-SNR357-CO2",
    price: 64999,
    stock: 4,
    category_slug: "pistols",
    caliber: '0.177" (4.5mm)',
    power_plant: "CO2",
    velocity: "350 fps",
    is_featured: false,
    short_description:
      "Double/single-action CO2 revolver, 350 fps, 6-round swing-out cylinder, 870g.",
    description:
      "The Crosman SNR357 CO2 Revolver features a realistic double/single-action mechanism with a 6-round swing-out cylinder. Delivers 350 fps at 870g with a 2.5 inch barrel. 40-60 shots per CO2 cartridge.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Double / Single Action" },
      { key: "Power Source", value: "CO2" },
      { key: "Power", value: "Up to 3 Joules" },
      { key: "Velocity", value: "350 fps" },
      { key: "Total Weight", value: "870 Grams" },
      { key: "Barrel Length", value: '2.5" Inch' },
      { key: "Magazine", value: "6 rounds (swing-out), 40-60 shots" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "No Warranty" },
    ],
  },
  {
    name: 'Webley MKVI CO2 Pellet 6" Revolver',
    slug: "webley-mkvi-co2-pellet-revolver",
    brand: "Webley",
    sku: "WEB-MKVI-CO2-6IN",
    price: 74999,
    stock: 3,
    category_slug: "pistols",
    caliber: '0.177" (4.5mm)',
    power_plant: "CO2",
    velocity: "430 fps",
    is_featured: false,
    short_description:
      'WWI MKVI revolver replica, 430 fps, 6 cartridge shells, 1011g, 6" barrel.',
    description:
      "The Webley MKVI CO2 Pellet Revolver is a stunning replica of the iconic WWI service revolver. Features 6 realistic cartridge shells, a 6-inch barrel delivering 430 fps, and a solid 1011g frame — a collector's showpiece and precision shooter.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Revolver" },
      { key: "Power Source", value: "CO2" },
      { key: "Power", value: "Up to 3 Joules" },
      { key: "Velocity", value: "430 fps" },
      { key: "Total Weight", value: "1011 Grams" },
      { key: "Barrel Length", value: '6" Inch' },
      { key: "Magazine", value: "6 realistic cartridge shells" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "No Warranty" },
    ],
  },
  {
    name: "Star PX With Combo",
    slug: "star-px-with-combo",
    brand: "Camstar",
    sku: "CAM-STAR-PX-COMBO",
    price: 28499,
    stock: 7,
    category_slug: "air-rifles",
    caliber: '0.177" (4.5mm)',
    power_plant: "PCP",
    velocity: "265 mps / 870 fps",
    is_featured: true,
    short_description:
      "PCP side-lever rifle, 2x10-shot mags, 870 fps, 90 shots per fill. No licence required.",
    description:
      "The Star PX With Combo is a reliable PCP air rifle with side-lever action and 2 x 10-shot magazines. Delivers 870 fps from a 480mm barrel with 90 shots per fill. Ideal for field target shooting and pest control.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Side Lever" },
      { key: "Power Source", value: "PCP" },
      { key: "Power", value: "Up to 20 Joules" },
      { key: "Velocity", value: "265 mps / 870 fps" },
      { key: "Total Weight", value: "2.45 kg" },
      { key: "Barrel Length", value: "480mm" },
      { key: "Magazine", value: "10 Shot x 2 Magazines" },
      { key: "Shots Per Fill", value: "90" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    ],
  },
  {
    name: "Precihole Sports NX100 Club Elite Plus",
    slug: "precihole-nx100-club-elite-plus",
    brand: "Precihole Sports",
    sku: "PRE-NX100-ELITE",
    price: 11999,
    stock: 20,
    category_slug: "air-rifles",
    caliber: '0.177" (4.5mm)',
    power_plant: "Nitro Piston",
    velocity: "180 mps / 600 fps",
    is_featured: true,
    short_description:
      "Entry-level nitro piston break-barrel rifle, 600 fps, 3.1 kg, 450mm barrel.",
    description:
      "The Precihole Sports NX100 Club Elite Plus is an entry-level break-barrel air rifle powered by a nitro piston. Delivers 600 fps at 7.5 Joules from its 450mm barrel, weighing 3.1 kg. Perfect for beginners and club shooters.",
    specifications: [
      { key: "Caliber", value: '0.177" (4.5mm)' },
      { key: "Action", value: "Break Barrel" },
      { key: "Power Source", value: "Nitro Piston" },
      { key: "Power", value: "7.5 Joules" },
      { key: "Velocity", value: "180 mps / 600 fps" },
      { key: "Total Weight", value: "3.1 kgs" },
      { key: "Barrel Length", value: "450mm" },
      { key: "Licence Required", value: "No Licence Required" },
      { key: "Warranty", value: "6 Months Manufacturer Warranty" },
    ],
  },
];

const client = new MongoClient(mongoUri());

try {
  await client.connect();
  console.log("Connected to:", DB_NAME);
  const db = client.db(DB_NAME);
  const col = db.collection("products");

  // Step 1: Delete all existing products
  const deleted = await col.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} existing products.\n`);

  // Step 2: Insert real products
  let count = 0;
  for (const p of products) {
    const seo = {
      meta_title: `${p.name} | TacticalTune`,
      meta_description: p.short_description,
      meta_keywords: [p.brand, p.power_plant, p.caliber].filter(Boolean),
    };

    await col.insertOne({
      _id: new ObjectId(),
      __v: 0,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      sku: p.sku,
      short_description: p.short_description,
      description: p.description,
      currency: "INR",
      price: p.price,
      compare_at_price: null,
      category_id: null,
      category_slug: p.category_slug,
      sub_category: null,
      tags: [p.brand, p.power_plant, p.caliber, p.category_slug].filter(Boolean),
      images: [
        {
          url: PLACEHOLDER,
          alt: p.name,
          is_primary: true,
          order: 0,
          fileId: null,
          name: null,
          filePath: null,
          thumbnailUrl: null,
        },
      ],
      analytics,
      faqs: [],
      stock: p.stock,
      low_stock_threshold: 3,
      track_inventory: true,
      is_active: true,
      is_deleted: false,
      is_featured: p.is_featured,
      licence_required: false,
      requiresHandling: false,
      requiresPremiumProtection: false,
      power_plant: p.power_plant,
      caliber: p.caliber,
      velocity: p.velocity,
      specifications: p.specifications,
      seo,
      seo_title: seo.meta_title,
      seo_description: seo.meta_description,
      shipping,
      visibility_priority: count,
      created_by_admin: "seed",
      updated_by_admin: "seed",
      createdAt: now,
      updatedAt: now,
      created_at: now,
      updated_at: now,
    });

    console.log(`  [${++count}/10] Inserted: ${p.name} — ₹${p.price.toLocaleString("en-IN")}`);
  }

  console.log(`\nDone! ${count} products inserted.`);
  console.log("NOTE: All images are placeholders. Share the ImageKit folder links to update images.");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
