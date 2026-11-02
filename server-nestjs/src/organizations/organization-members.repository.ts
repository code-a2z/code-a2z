import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  type Collection,
  type IndexDescription,
  type ObjectId,
  type WithId,
} from 'mongodb';
import { COLLECTION_NAMES } from '../database/collection-names.js';
import { DatabaseService } from '../database/database.service.js';
import { prepareOrganizationMember } from './organization-member.validation.js';
import type {
  CreateOrganizationMemberInput,
  OrganizationMember,
} from './types/organization-member.js';

export const ORGANIZATION_MEMBER_INDEXES: IndexDescription[] = [
  { key: { user_id: 1 } },
  { key: { org_id: 1 } },
  { key: { user_id: 1, org_id: 1 }, unique: true },
];

@Injectable()
export class OrganizationMembersRepository implements OnApplicationBootstrap {
  constructor(private readonly database: DatabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.collection.createIndexes(ORGANIZATION_MEMBER_INDEXES);
  }

  async create(
    input: CreateOrganizationMemberInput,
  ): Promise<WithId<OrganizationMember>> {
    const document = prepareOrganizationMember(input);
    const result = await this.collection.insertOne(document);

    return { ...document, _id: result.insertedId };
  }

  findById(id: ObjectId): Promise<WithId<OrganizationMember> | null> {
    return this.collection.findOne({ _id: id });
  }

  findByUserAndOrganization(
    userId: ObjectId,
    organizationId: ObjectId,
  ): Promise<WithId<OrganizationMember> | null> {
    return this.collection.findOne({
      user_id: userId,
      org_id: organizationId,
    });
  }

  private get collection(): Collection<OrganizationMember> {
    return this.database
      .getDb()
      .collection<OrganizationMember>(COLLECTION_NAMES.ORGANIZATION_MEMBERS);
  }
}
