import { MongoClient, Db } from "mongodb";
console.log("=== MONGO DEBUG START ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "MONGODB_URI exists?",
  process.env.MONGODB_URI ? "YES" : "NO"
);
console.log("MONGODB_DB_NAME:", process.env.MONGODB_DB_NAME);
console.log("=== MONGO DEBUG END ===");
const uri = process.env.MONGODB_URI as string;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "production") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    if (!uri) {
      console.error("MONGODB_URI missing in Production");
      throw new Error("Database configuration missing");
    }

    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  if (!uri) {
    console.error("MONGODB_URI missing in production");
    throw new Error("Database configuration missing");
  }

  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;

  const dbName = process.env.MONGODB_DB_NAME || "Flowstream";

  if (!dbName) {
    console.error("MONGODB_DB_NAME missing");
  }

  return client.db(dbName);
}