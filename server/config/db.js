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
const connectOpts = {
  maxPoolSize: process.env.VERCEL ? 5 : 10,
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  // Drop stale resolved promise when the socket is gone (0 disconnected, 3 disconnecting).
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.promise = null;
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, connectOpts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  if (mongoose.connection.readyState !== 1) {
    cached.promise = null;
    cached.conn = null;
    throw new Error("MongoDB connection not ready after connect()");
  }

  return cached.conn;
}

module.exports = connectDB;
