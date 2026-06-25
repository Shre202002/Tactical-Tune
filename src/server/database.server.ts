import { MongoClient, type Collection, type Db, type Document } from "mongodb";

const DEFAULT_CLUSTER = "cluster1.a8ttkac.mongodb.net";
const DEFAULT_DATABASE = "tactical_hub";

type MongoGlobal = typeof globalThis & {
  __tacticalMongoClientPromise?: Promise<MongoClient>;
};

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const username = process.env.db_user;
  const password = process.env.db_password;
  if (!username || !password) {
    throw new Error(
      "MongoDB credentials are missing. Set MONGODB_URI or db_user and db_password.",
    );
  }

  return `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${DEFAULT_CLUSTER}/?appName=Cluster1`;
}

function getClientPromise() {
  const mongoGlobal = globalThis as MongoGlobal;
  if (!mongoGlobal.__tacticalMongoClientPromise) {
    const client = new MongoClient(getMongoUri(), {
      maxPoolSize: 20,
      minPoolSize: 0,
      retryWrites: true,
    });
    mongoGlobal.__tacticalMongoClientPromise = client.connect();
  }
  return mongoGlobal.__tacticalMongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DATABASE || DEFAULT_DATABASE);
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const database = await getDatabase();
  return database.collection<T>(name);
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}
