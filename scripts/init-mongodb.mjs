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

const categories = [
  {
    name: "CO2 Air Pistols",
    slug: "co2-air-pistols",
    description: "High-performance CO2 powered air pistols for sport shooting",
    image:
      "https://www.invincibleone.in/wp-content/uploads/2021/04/PicsArt_04-10-02.14.16-scaled.jpg",
    sort_order: 1,
  },
  {
    name: "PCP Air Rifles",
    slug: "pcp-air-rifles",
    description: "Pre-Charged Pneumatic air rifles for precision shooting",
    image: "https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg",
    sort_order: 2,
  },
  {
    name: "Break Barrel Air Rifles",
    slug: "break-barrel-air-rifles",
    description: "Spring and nitro piston break barrel air rifles",
    image: "https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg",
    sort_order: 3,
  },
  {
    name: "CO2 Revolvers",
    slug: "co2-revolvers",
    description: "Classic full-metal CO2 revolvers for collectors and shooters",
    image:
      "https://www.invincibleone.in/wp-content/uploads/2021/06/PicsArt_06-17-06.58.56-scaled.jpg",
    sort_order: 4,
  },
  {
    name: "PCP Air Pistols",
    slug: "pcp-air-pistols",
    description: "High-power PCP air pistols with rifle-like accuracy",
    image: "https://www.airgunkart.com/wp-content/uploads/harpy-x3.jpg",
    sort_order: 5,
  },
];

const products = [
  {
    name: "Camstar Star PXi .177 Cal PCP Air Rifle",
    slug: "camstar-star-pxi-pcp-air-rifle",
    brand: "Camstar Sports",
    short_description:
      "India's premium PCP air rifle with side-lever action, 10-shot magazine and 870 FPS velocity.",
    description:
      "Designed and manufactured in India with a side-lever action, two-stage trigger, integrated suppressor and 10-shot rotary magazine.",
    sku: "TT-PXICPRI-001",
    price: 31999,
    compare_at_price: 35000,
    category_slug: "pcp-air-rifles",
    sub_category: "Indian PCP Rifles",
    tags: ["pcp", "air rifle", "camstar", "made in india", "no licence"],
    image: "https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg",
    stock: 8,
    is_featured: true,
    power_plant: "PCP (Pre-Charged Pneumatic)",
    caliber: ".177 (4.5mm)",
    velocity: "Up to 870 FPS / 265 mps",
    specifications: [
      { key: "Power", value: "20 Joules" },
      { key: "Magazine Capacity", value: "10 shots" },
      { key: "Max Fill Pressure", value: "200 Bar / 2900 PSI" },
      { key: "Country of Origin", value: "India" },
    ],
  },
  {
    name: "Camstar Star PX .177 Cal PCP Air Rifle",
    slug: "camstar-star-px-pcp-air-rifle",
    brand: "Camstar Sports",
    short_description:
      "Classic Black PCP air rifle with spare magazine and up to 90 shots per fill.",
    description:
      "A reliable Indian PCP air rifle designed for accuracy, consistency and ease of use.",
    sku: "TT-PXCPRI-002",
    price: 24999,
    compare_at_price: 27000,
    category_slug: "pcp-air-rifles",
    sub_category: "Indian PCP Rifles",
    tags: ["pcp", "air rifle", "camstar", "made in india"],
    image: "https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg",
    stock: 12,
    is_featured: false,
    power_plant: "PCP (Pre-Charged Pneumatic)",
    caliber: ".177 (4.5mm)",
    velocity: "Up to 850 FPS",
    specifications: [
      { key: "Shots Per Fill", value: "Up to 90" },
      { key: "Warranty", value: "12 Months" },
      { key: "Country of Origin", value: "India" },
    ],
  },
  {
    name: "Precihole NX200 Athena Karbin Air Rifle .177 Cal",
    slug: "precihole-nx200-athena-karbin-air-rifle",
    brand: "Precihole Sports",
    short_description:
      "Compact break-barrel rifle with classic stock, accurate barrel and maximum legal power.",
    description:
      "The next generation of Precihole's NX series with a short barrel and fleur-de-lis stock checkering.",
    sku: "TT-NX200ATH-003",
    price: 14000,
    compare_at_price: 16399,
    category_slug: "break-barrel-air-rifles",
    sub_category: "Indian Air Rifles",
    tags: ["precihole", "nx200", "break barrel", "made in india"],
    image: "https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg",
    stock: 15,
    is_featured: true,
    power_plant: "Spring Piston",
    caliber: ".177 (4.5mm)",
    velocity: "Up to 625 FPS",
    specifications: [
      { key: "Action", value: "Break Barrel" },
      { key: "Barrel", value: "Short Karbin Barrel" },
      { key: "Country of Origin", value: "India" },
    ],
  },
  {
    name: "Precihole NX100 Club Elite Plus Air Rifle .177 Cal",
    slug: "precihole-nx100-club-elite-plus-air-rifle",
    brand: "Precihole Sports",
    short_description:
      "Open-sight competition air rifle with Nitro Piston technology and enhanced trigger.",
    description:
      "A competition-focused break-barrel air rifle with improved ergonomics and proven Club accuracy.",
    sku: "TT-NX100CEP-004",
    price: 13000,
    compare_at_price: 14000,
    category_slug: "break-barrel-air-rifles",
    sub_category: "Indian Air Rifles",
    tags: ["precihole", "nx100", "nitro piston", "competition"],
    image: "https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg",
    stock: 20,
    is_featured: false,
    power_plant: "Nitro Piston",
    caliber: ".177 (4.5mm)",
    velocity: "600 FPS / 180 mps",
    specifications: [
      { key: "Power", value: "7.5 Joules / 5.5 ft-lb" },
      { key: "Sights", value: "Open Sight" },
      { key: "Country of Origin", value: "India" },
    ],
  },
  {
    name: "Precihole PX100 Benchrest X3 PCP Air Rifle",
    slug: "precihole-px100-benchrest-x3-pcp-air-rifle",
    brand: "Precihole Sports",
    short_description:
      "Match-grade PCP benchrest rifle with integrated suppressor and precision trigger.",
    description:
      "A regulated match-grade platform with Dovetail and Picatinny mounting options.",
    sku: "TT-PX100BX3-005",
    price: 45499,
    compare_at_price: 49000,
    category_slug: "pcp-air-rifles",
    sub_category: "Match Grade PCP",
    tags: ["precihole", "px100", "benchrest", "pcp", "match grade"],
    image: "https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg",
    stock: 5,
    is_featured: true,
    power_plant: "PCP (Regulated)",
    caliber: ".177 (4.5mm)",
    velocity: "Competition grade consistency",
    specifications: [
      { key: "Trigger", value: "Match Grade" },
      { key: "Suppressor", value: "Integrated" },
      { key: "Scope Rail", value: "Dovetail + Picatinny" },
    ],
  },
  {
    name: "Precihole PP100 Harpy X3 Air Pistol",
    slug: "precihole-pp100-harpy-x3-air-pistol",
    brand: "Precihole Sports",
    short_description:
      "High-power regulated PCP pistol with rifle-like accuracy and match-grade trigger.",
    description:
      "A precision PCP pistol with regulated cylinder, integrated suppressor and accessory rails.",
    sku: "TT-PP100HX3-006",
    price: 26499,
    compare_at_price: 29000,
    category_slug: "pcp-air-pistols",
    sub_category: "Indian PCP Pistols",
    tags: ["precihole", "harpy", "pcp", "air pistol"],
    image: "https://www.airgunkart.com/wp-content/uploads/harpy-x3.jpg",
    stock: 7,
    is_featured: false,
    power_plant: "PCP (Regulated)",
    caliber: ".177 (4.5mm)",
    velocity: "High Power — regulated",
    specifications: [
      { key: "Trigger", value: "Match Grade" },
      { key: "Suppressor", value: "Integrated" },
      { key: "Country of Origin", value: "India" },
    ],
  },
  {
    name: "Crosman 1911 CO2 BB Pistol .177 Cal",
    slug: "crosman-1911-co2-bb-pistol-177-cal",
    brand: "Crosman",
    short_description:
      "Realistic semi-automatic 1911 CO2 clone with a 20-shot BB magazine.",
    description:
      "A 12-gram CO2 powered plinking pistol with double-action trigger and realistic handling.",
    sku: "TT-CRO1911-007",
    price: 9499,
    compare_at_price: 11000,
    category_slug: "co2-air-pistols",
    sub_category: "Imported CO2 Pistols",
    tags: ["crosman", "1911", "co2", "bb pistol"],
    image:
      "https://www.invincibleone.in/wp-content/uploads/2021/04/PicsArt_04-10-02.14.16-scaled.jpg",
    stock: 18,
    is_featured: false,
    power_plant: "CO2 (12g cartridge)",
    caliber: ".177 Cal (4.5mm)",
    velocity: "480 FPS",
    specifications: [
      { key: "Shot Capacity", value: "20 rounds" },
      { key: "Action", value: "Semi-Automatic, Double-Action" },
    ],
  },
  {
    name: "Crosman SNR357 CO2 Full Metal Dual Ammo Revolver",
    slug: "crosman-snr357-co2-full-metal-revolver",
    brand: "Crosman",
    short_description:
      "Full-metal snub-nose CO2 revolver that fires both BBs and pellets.",
    description:
      "A six-round swing-out cylinder revolver with reusable cartridges and adjustable rear sight.",
    sku: "TT-SNR357-008",
    price: 14999,
    compare_at_price: 17000,
    category_slug: "co2-revolvers",
    sub_category: "Imported CO2 Revolvers",
    tags: ["crosman", "snr357", "revolver", "co2", "full metal"],
    image: "https://www.invincibleone.in/wp-content/uploads/2022/05/146457-scaled.jpg",
    stock: 10,
    is_featured: true,
    power_plant: "CO2 (12g cartridge)",
    caliber: ".177 (4.5mm)",
    velocity: "400 FPS (BB) / 350 FPS (Pellet)",
    specifications: [
      { key: "Ammo Type", value: "BB and Lead Pellets" },
      { key: "Shot Capacity", value: "6 rounds" },
      { key: "Material", value: "Full Metal" },
    ],
  },
  {
    name: 'Webley MKVI CO2 Pellet Revolver 6" — Battlefield Finish',
    slug: "webley-mkvi-co2-pellet-revolver-battlefield-finish",
    brand: "Webley",
    short_description:
      "Full-metal CO2 pellet revolver based on the legendary British service sidearm.",
    description:
      "Built from original-style blueprints with a distressed battlefield finish and rifled barrel.",
    sku: "TT-WBMKVI-009",
    price: 19999,
    compare_at_price: 22500,
    category_slug: "co2-revolvers",
    sub_category: "Imported CO2 Revolvers",
    tags: ["webley", "mkvi", "co2", "revolver", "collectible"],
    image:
      "https://www.invincibleone.in/wp-content/uploads/2021/06/PicsArt_06-17-06.58.56-scaled.jpg",
    stock: 6,
    is_featured: true,
    power_plant: "CO2 (12g cartridge)",
    caliber: ".177 (4.5mm)",
    velocity: "430 FPS",
    specifications: [
      { key: "Shot Capacity", value: "6 rounds" },
      { key: "Barrel Length", value: "6.0 inch" },
      { key: "Finish", value: "Battlefield Distressed" },
    ],
  },
  {
    name: "Evanix MP30 Semi-Automatic PCP Air Rifle .177",
    slug: "evanix-mp30-semi-automatic-pcp-air-rifle-177",
    brand: "Evanix",
    short_description:
      "Premium semi-automatic PCP rifle with 24-shot magazine and adjustable regulator.",
    description:
      "A compact tactical PCP platform with rapid follow-up shots and multiple Picatinny rails.",
    sku: "TT-EVMP30-010",
    price: 225000,
    compare_at_price: null,
    category_slug: "pcp-air-rifles",
    sub_category: "Premium Import PCP",
    tags: ["evanix", "mp30", "pcp", "semi automatic", "premium"],
    image: "https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg",
    stock: 3,
    is_featured: true,
    power_plant: "PCP (Regulated, Semi-Auto)",
    caliber: ".177 (4.5mm)",
    velocity: "High Power",
    specifications: [
      { key: "Magazine Capacity", value: "24 shots" },
      { key: "Regulator", value: "Adjustable" },
      { key: "Brand", value: "Evanix (Korea)" },
    ],
  },
];

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
          images: [{ url: image, alt: product.name, order: 0 }],
          low_stock_threshold: 3,
          is_active: true,
          licence_required: false,
          seo_title: `${product.name} | TacticalTune`,
          seo_description: product.short_description,
          updated_at: now,
        },
        $unset: { image: "" },
        $setOnInsert: { _id: new ObjectId(), created_at: now },
      },
      { upsert: true },
    );
  }

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
    const users = db.collection("users");
    const existing = await users.findOne({ email });
    if (!existing) {
      await users.insertOne({
        _id: new ObjectId(),
        email,
        password_hash: await hashPassword(process.env.SEED_ADMIN_PASSWORD),
        full_name: "TacticalTune Administrator",
        phone: null,
        avatar_url: null,
        role: "super_admin",
        created_at: now,
        updated_at: now,
      });
    } else {
      await users.updateOne(
        { _id: existing._id },
        { $set: { role: "super_admin", updated_at: now } },
      );
    }
  }

  console.log(`MongoDB initialized: ${databaseName}`);
  console.log("Collections: users, categories, products, carts, orders, promos, product_images");
} finally {
  await client.close();
}
