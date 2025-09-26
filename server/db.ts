import mongoose from "mongoose";

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Don't throw to keep app functional in demo mode
    console.warn("MONGODB_URI is not set; running in demo mode without DB");
    return Promise.resolve(mongoose); // callers should check isDbConnected()
  }
  // Use a fixed dbName per spec
  return mongoose.connect(uri, { dbName: "vyom" });
}

export function isDbConnected(): boolean {
  // 1 = connected, 2 = connecting; treat 1 as ready
  return mongoose.connection?.readyState === 1;
}
