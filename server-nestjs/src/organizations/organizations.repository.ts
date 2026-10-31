import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  type Collection,
  type IndexDescription,
  type ObjectId,
  type WithId,
} from 'mongodb';
import { COLLECTION_NAMES } from '../database/collection-names.js';
import { DatabaseService } from '../database/database.service.js';
import { prepareOrganization } from './organization.validation.js';
import type {
  CreateOrganizationInput,
  Organization,
} from './types/organization.js';

export const ORGANIZATION_INDEXES: IndexDescription[] = [
  { key: { slug: 1 }, unique: true },
  { key: { status: 1 } },
  {
    key: { requested_by_email: 1 },
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
];

@Injectable()
export class OrganizationsRepository implements OnApplicationBootstrap {
  constructor(private readonly database: DatabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.collection.createIndexes(ORGANIZATION_INDEXES);
  }

  async create(input: CreateOrganizationInput): Promise<WithId<Organization>> {
    const document = prepareOrganization(input);
    const result = await this.collection.insertOne(document);

    return { ...document, _id: result.insertedId };
  }

  findById(id: ObjectId): Promise<WithId<Organization> | null> {
    return this.collection.findOne({ _id: id });
  }

  findBySlug(slug: string): Promise<WithId<Organization> | null> {
    return this.collection.findOne({ slug: slug.trim().toLowerCase() });
  }

  private get collection(): Collection<Organization> {
    return this.database
      .getDb()
      .collection<Organization>(COLLECTION_NAMES.ORGANIZATIONS);
  }
}
