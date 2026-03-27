const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Reuses one Mongoose connection across Vercel serverless invocations (warm instances).
 * Avoids process.exit on failure so the API can return 503 instead of crashing the lambda.
 */
async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: process.env.VERCEL ? 5 : 10,
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(MONGO_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
