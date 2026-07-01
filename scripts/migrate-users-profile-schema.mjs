import { MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DATABASE || "tactical_hub";

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const user = process.env.db_user || process.env.username;
  const password = process.env.db_password || process.env.password;
  if (!user || !password) {
    throw new Error("Set MONGODB_URI or username/password in .env.local.");
  }
  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@cluster1.a8ttkac.mongodb.net/?appName=Cluster1`;
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function splitFullName(fullName) {
  const parts = clean(fullName).split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function fullName(firstName, lastName, fallback) {
  return [firstName, lastName].filter(Boolean).join(" ") || clean(fallback) || null;
}

function validDate(value, fallback) {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : fallback;
}

const userJsonSchema = {
  bsonType: "object",
  required: [
    "_id",
    "__v",
    "createdAt",
    "email",
    "emailVerified",
    "firebaseId",
    "firstName",
    "lastLogin",
    "lastName",
    "phone",
    "phoneVerified",
    "role",
    "status",
    "updatedAt",
  ],
  properties: {
    _id: { bsonType: "objectId" },
    __v: { bsonType: "int" },
    address: { bsonType: "string" },
    city: { bsonType: "string" },
    createdAt: { bsonType: "date" },
    email: { bsonType: "string" },
    emailVerified: { bsonType: "bool" },
    firebaseId: { bsonType: "string" },
    firstName: { bsonType: "string" },
    landmark: { bsonType: "string" },
    lastLogin: { bsonType: "date" },
    lastName: { bsonType: "string" },
    phone: { bsonType: "string" },
    phoneVerified: { bsonType: "bool" },
    pincode: { bsonType: "string" },
    role: { bsonType: "string" },
    state: { bsonType: "string" },
    status: { bsonType: "string" },
    updatedAt: { bsonType: "date" },
  },
};

const client = new MongoClient(mongoUri());

try {
  await client.connect();
  const db = client.db(databaseName);
  const users = db.collection("users");
  const rows = await users.find({}).toArray();
  const now = new Date();

  if (rows.length > 0) {
    await users.bulkWrite(
      rows.map((user) => {
        const fallbackName = splitFullName(user.full_name);
        const firstName = clean(user.firstName) || fallbackName.firstName;
        const lastName = clean(user.lastName) || fallbackName.lastName;
        const createdAt = validDate(user.createdAt, validDate(user.created_at, now));
        const updatedAt = validDate(user.updatedAt, validDate(user.updated_at, createdAt));

        return {
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                __v: typeof user.__v === "number" ? user.__v : 0,
                email: clean(user.email),
                emailVerified: Boolean(user.emailVerified),
                firebaseId: clean(user.firebaseId) || `local:${user._id.toHexString()}`,
                firstName,
                lastName,
                full_name: fullName(firstName, lastName, user.full_name),
                phone: clean(user.phone),
                phoneVerified: Boolean(user.phoneVerified),
                role: clean(user.role) || "customer",
                status: clean(user.status) || "active",
                address: clean(user.address),
                landmark: clean(user.landmark),
                city: clean(user.city),
                state: clean(user.state),
                pincode: clean(user.pincode),
                lastLogin: validDate(user.lastLogin, updatedAt),
                createdAt,
                updatedAt,
                created_at: createdAt,
                updated_at: updatedAt,
              },
            },
          },
        };
      }),
    );
  }

  try {
    await db.command({
      collMod: "users",
      validator: { $jsonSchema: userJsonSchema },
      validationLevel: "moderate",
      validationAction: "error",
    });
  } catch (error) {
    if (error.codeName !== "NamespaceNotFound") throw error;
    await db.createCollection("users", {
      validator: { $jsonSchema: userJsonSchema },
      validationLevel: "moderate",
      validationAction: "error",
    });
  }

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ firebaseId: 1 }, { unique: true });
  await users.createIndex({ status: 1, role: 1 });

  console.log(`Users migrated: ${rows.length}`);
  console.log("User schema validator applied.");
} finally {
  await client.close();
}
