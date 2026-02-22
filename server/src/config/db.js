import mongoose from 'mongoose';

import { MONGODB_URL } from '../config/env.js';

const CONNECTED = 1;

/**
 * Connect to MongoDB (used at server startup in index.js).
 * Exits process on failure for traditional long-running server.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Ensure MongoDB is connected. Idempotent: no-op if already connected.
 * Use in serverless (e.g. Vercel) where index.js never runs, so connectDB() is never called.
 * Each request must ensure connection before running queries to avoid "buffering timed out".
 */
export const ensureConnected = async () => {
  if (mongoose.connection.readyState === CONNECTED) {
    return;
  }
  await mongoose.connect(MONGODB_URL, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
  });
};

export default connectDB;
