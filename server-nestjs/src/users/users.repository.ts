import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  type Collection,
  type IndexDescription,
  type ObjectId,
  type WithId,
} from 'mongodb';
import { COLLECTION_NAMES } from '../database/collection-names.js';
import { DatabaseService } from '../database/database.service.js';
import type { CreateUserInput, User } from './types/user.js';
import { prepareUser } from './user.validation.js';

export const USER_INDEXES: IndexDescription[] = [
  { key: { 'personal_info.subscriber_id': 1 }, unique: true },
  { key: { 'personal_info.username': 1 }, unique: true },
];

@Injectable()
export class UsersRepository implements OnApplicationBootstrap {
  constructor(private readonly database: DatabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.collection.createIndexes(USER_INDEXES);
  }

  async create(input: CreateUserInput): Promise<WithId<User>> {
    const document = prepareUser(input);
    const result = await this.collection.insertOne(document);

    return { ...document, _id: result.insertedId };
  }

  findById(id: ObjectId): Promise<WithId<User> | null> {
    return this.collection.findOne({ _id: id });
  }

  findByUsername(username: string): Promise<WithId<User> | null> {
    return this.collection.findOne({
      'personal_info.username': username.toLowerCase(),
    });
  }

  private get collection(): Collection<User> {
    return this.database.getDb().collection<User>(COLLECTION_NAMES.USERS);
  }
}
