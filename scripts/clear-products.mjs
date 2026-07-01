import { MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DATABASE || "tactical_hub";
const DUMMY_CATEGORY_SLUGS = [
  "co2-air-pistols",
  "pcp-air-rifles",
  "break-barrel-air-rifles",
  "co2-revolvers",
  "pcp-air-pistols",
];
const DUMMY_PRODUCT_SLUGS = [
  "camstar-star-pxi-pcp-air-rifle",
  "camstar-star-px-pcp-air-rifle",
  "precihole-nx200-athena-karbin-air-rifle",
  "precihole-nx100-club-elite-plus-air-rifle",
  "precihole-px100-benchrest-x3-pcp-air-rifle",
  "precihole-pp100-harpy-x3-air-pistol",
  "crosman-1911-co2-bb-pistol-177-cal",
  "crosman-snr357-co2-full-metal-revolver",
  "webley-mkvi-co2-pellet-revolver-battlefield-finish",
  "evanix-mp30-semi-automatic-pcp-air-rifle-177",
];

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (!process.env.db_user || !process.env.db_password) {
    throw new Error("Set MONGODB_URI or db_user and db_password.");
  }
  return `mongodb+srv://${encodeURIComponent(process.env.db_user)}:${encodeURIComponent(process.env.db_password)}@cluster1.a8ttkac.mongodb.net/?appName=Cluster1`;
}

async function clearCatalog() {
  const client = new MongoClient(mongoUri());
  try {
    await client.connect();
    const db = client.db(databaseName);

    const [products, categories] = await Promise.all([
      db.collection("products").deleteMany({ slug: { $in: DUMMY_PRODUCT_SLUGS } }),
      db.collection("categories").deleteMany({ slug: { $in: DUMMY_CATEGORY_SLUGS } }),
    ]);

    console.log(`Deleted ${products.deletedCount} seeded dummy products from the database.`);
    console.log(`Deleted ${categories.deletedCount} seeded dummy categories from the database.`);
  } catch (error) {
    console.error("Error clearing catalog:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

clearCatalog();
