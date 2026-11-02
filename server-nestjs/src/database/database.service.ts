import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, type Db } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client?: MongoClient;
  private database?: Db;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.config.getOrThrow<string>('MONGODB_URL');
    const client = new MongoClient(uri);

    try {
      await client.connect();
      this.client = client;
      this.database = client.db();
    } catch (error) {
      await client.close();
      throw error;
    }
  }

  getDb(): Db {
    if (!this.database) {
      throw new Error('MongoDB is not connected');
    }

    return this.database;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }
}
