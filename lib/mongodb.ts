import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not found. Some features may not work.");
}

const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/pass-ve-phim";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (!MONGODB_URI || MONGODB_URI === "mongodb://localhost:27017/pass-ve-phim") {
    console.warn("MongoDB not configured. Using mock connection.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout sau 5 giây
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await Promise.race([
      cached.promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MongoDB connection timeout")), 10000)
      ),
    ]) as typeof mongoose;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error:", e);
    return null;
  }

  return cached.conn;
}

export default connectDB;

