import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  type Collection,
  type IndexDescription,
  type ObjectId,
  type WithId,
} from 'mongodb';
import { COLLECTION_NAMES } from '../database/collection-names.js';
import { DatabaseService } from '../database/database.service.js';
import { prepareSubscriber } from './subscriber.validation.js';
import type { CreateSubscriberInput, Subscriber } from './types/subscriber.js';

export const SUBSCRIBER_INDEXES: IndexDescription[] = [
  { key: { email: 1 }, unique: true },
];

@Injectable()
export class SubscribersRepository implements OnApplicationBootstrap {
  constructor(private readonly database: DatabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.collection.createIndexes(SUBSCRIBER_INDEXES);
  }

  async create(input: CreateSubscriberInput): Promise<WithId<Subscriber>> {
    const document = prepareSubscriber(input);
    const result = await this.collection.insertOne(document);

    return { ...document, _id: result.insertedId };
  }

  findById(id: ObjectId): Promise<WithId<Subscriber> | null> {
    return this.collection.findOne({ _id: id });
  }

  findByEmail(email: string): Promise<WithId<Subscriber> | null> {
    return this.collection.findOne({ email });
  }

  private get collection(): Collection<Subscriber> {
    return this.database
      .getDb()
      .collection<Subscriber>(COLLECTION_NAMES.SUBSCRIBERS);
  }
}
