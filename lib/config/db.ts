import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_DATABASE_URL || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_DATABASE_URL environment variable."
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("MongoDB connection error", e);
    throw e;
  }

  return cached.conn;
}
