import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri: string = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
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

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  // IMPORTANT: Avoid leading/trailing spaces in DB name; they produce invalid namespaces
  // like ` Flowstream.users` and cause MongoDB code 73 (InvalidNamespace).
  return client.db(process.env.MONGODB_DB_NAME || "Flowstream");
}
