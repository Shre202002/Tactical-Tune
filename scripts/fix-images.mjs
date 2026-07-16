import { MongoClient } from "mongodb";

const DB_NAME = process.env.MONGODB_DATABASE || "tactical_hub";

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const res = await db.collection("products").updateMany(
    { $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] },
    {
      $set: {
        images: [
          {
            url: "https://ik.imagekit.io/ari07rsa2/Tactical-Tune/placeholder-product.webp",
            alt: "Placeholder",
            is_primary: true,
            order: 0,
          },
        ],
      },
    }
  );
  console.log("Fixed", res.modifiedCount, "products with missing images");
  await client.close();
}

main().catch(console.error);
