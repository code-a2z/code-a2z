import { MongoClient } from "mongodb";
import envConfig from "../../config/env.js";

const client = new MongoClient(envConfig.database.mongodb.url);

export const connectMongoDB = async () => {
  console.log('Connecting to database... -> ', envConfig.database.mongodb.url);
  try {
    await client.connect();
    console.log('Database connection successful');
    return client.db();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export const verifyMongoDBConnection = async () => {
  try {
    const result = await client.db().admin().ping();
    console.log('Database connection successful', result);
    return {
      status: result.ok,
      message: result.ok ? 'Database connected' : 'Database connection failed',
    };
  } catch (error) {
    console.error('Database connection failed', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
