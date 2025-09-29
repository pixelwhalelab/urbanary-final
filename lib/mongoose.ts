import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  _mongoose?: MongooseCache;
};

let cached = globalWithMongoose._mongoose;

if (!cached) {
  cached = globalWithMongoose._mongoose = { conn: null, promise: null };
}

if (!cached.promise) {
  cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
    console.log(`✅ MongoDB connected at: ${MONGODB_URI}`);
    return m;
  });
}

export default cached.promise;
