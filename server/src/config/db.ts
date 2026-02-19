import mongoose from 'mongoose';

import { MONGODB_URL } from '../config/env.js';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
