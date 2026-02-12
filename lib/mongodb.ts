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
    client = new MongoClient(uri, options);
    console.log("🔄 Connecting to MongoDB in development mode...", { uri });
    globalWithMongo._mongoClientPromise = client.connect().then((conn) => {
      console.log("✅ MongoDB connected successfully");
      return conn;
    }).catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      throw err;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  console.log("🔄 Connecting to MongoDB in production mode...", { uri });
  clientPromise = client.connect().then((conn) => {
    console.log("✅ MongoDB connected successfully");
    return conn;
  }).catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  });
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