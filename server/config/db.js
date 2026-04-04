const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/** mongoose.connection.readyState */
const CONNECTED = 1;
const DISCONNECTED = 0;
const DISCONNECTING = 3;

/**
 * One shared connection for the process (and warm Vercel lambdas). On failure callers throw;
 * route middleware can return 503 instead of exiting.
 */
const connectOptions = {
  maxPoolSize: process.env.VERCEL ? 5 : 10,
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  if (mongoose.connection.readyState === CONNECTED) {
    cached.conn = mongoose;
    return cached.conn;
  }

  const socketGone =
    mongoose.connection.readyState === DISCONNECTED ||
    mongoose.connection.readyState === DISCONNECTING;
  if (socketGone) {
    cached.promise = null;
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, connectOptions);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  if (mongoose.connection.readyState !== CONNECTED) {
    cached.promise = null;
    cached.conn = null;
    throw new Error("MongoDB connection not ready after connect()");
  }

  return cached.conn;
}

module.exports = connectDB;
