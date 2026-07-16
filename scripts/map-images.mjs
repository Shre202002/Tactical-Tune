/**
 * scripts/map-images.mjs
 * Usage: node --env-file=.env.local scripts/map-images.mjs
 */

import { MongoClient, ObjectId } from "mongodb";

const DB_NAME = process.env.MONGODB_DATABASE || "tactical_hub";

async function main() {
  const key = process.env.Imagekit_PRIVATE_KEY || process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new Error("Missing ImageKit key in environment variables");
  const auth = Buffer.from(key + ':').toString('base64');

  console.log("Fetching files from ImageKit...");
  let allFiles = [];
  let skip = 0;
  while(true) {
      const res = await fetch(`https://api.imagekit.io/v1/files?type=file&limit=100&skip=${skip}`, {
          headers: { Authorization: 'Basic ' + auth }
      });
      const files = await res.json();
      if (!Array.isArray(files) || files.length === 0) break;
      allFiles = allFiles.concat(files.filter(f => f.filePath.startsWith('/Tactical Tune/Products/')));
      skip += 100;
  }
  console.log(`Found ${allFiles.length} files in /Tactical Tune/Products/`);

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection("products");

  const products = await col.find({}).toArray();
  
  // Custom mapping for folder names that differ slightly from product slugs
  const folderMapping = {
    "star-rx-gen-3": "Camstar Star RX Gen 3 CO2 Pellet",
    "precihole-nx200-athena-karbin": "Precihole Sports NX200", 
    "precihole-px100-achilles-x3": "Precihole Sports PX100",
    "precihole-pp100-harpy-x3": "Precihole Sports PP100",
    "star-pxi-suppressor-combo": "Star PXi",
    "crosman-1911-co2-pellet-pistol": "Crosman 1911", 
    "crosman-snr357-co2-revolver": "Crosman SNR357 Revolver",
    "webley-mkvi-co2-pellet-revolver": "Webley MKVI CO2 Pellet",
    "star-px-with-combo": "Star PX",
    "precihole-nx100-club-elite-plus": "Precihole Sports NX100 Club Elite Plus"
  };

  let mappedCount = 0;
  for (const p of products) {
     let matchedFiles = [];
     
     // 1st pass: direct mapping match
     let folderHint = folderMapping[p.slug];
     if (folderHint) {
         matchedFiles = allFiles.filter(f => f.filePath.includes(folderHint));
     }
     
     // 2nd pass: fuzzy match by product name
     if (matchedFiles.length === 0) {
         matchedFiles = allFiles.filter(f => f.filePath.toLowerCase().includes(p.name.toLowerCase()));
     }
     
     // 3rd pass: fuzzy match by part of the slug (brand + first word)
     if (matchedFiles.length === 0) {
         const parts = p.slug.split('-');
         if (parts.length >= 2) {
            matchedFiles = allFiles.filter(f => f.filePath.toLowerCase().includes(parts[0]) && f.filePath.toLowerCase().includes(parts[1]));
         }
     }

     if (matchedFiles.length > 0) {
         // Sort files so that something with "1" or "01" is primary if possible, else just keep order
         matchedFiles.sort((a,b) => a.name.localeCompare(b.name));
         
         const images = matchedFiles.map((f, index) => ({
             url: f.url,
             alt: p.name,
             is_primary: index === 0,
             order: index,
             fileId: f.fileId,
             name: f.name,
             filePath: f.filePath,
             thumbnailUrl: f.thumbnailUrl
         }));

         await col.updateOne({ _id: p._id }, { $set: { images } });
         console.log(`✅ Mapped ${images.length} images to ${p.name}`);
         mappedCount++;
     } else {
         console.log(`❌ No images found for ${p.name}`);
     }
  }

  console.log(`\nCompleted! Mapped images for ${mappedCount}/${products.length} products.`);
  await client.close();
}

main().catch(console.error);
