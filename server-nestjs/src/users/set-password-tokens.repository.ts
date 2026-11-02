import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  type Collection,
  type IndexDescription,
  type ObjectId,
  type WithId,
} from 'mongodb';
import { COLLECTION_NAMES } from '../database/collection-names.js';
import { DatabaseService } from '../database/database.service.js';
import { prepareSetPasswordToken } from './set-password-token.validation.js';
import type {
  CreateSetPasswordTokenInput,
  SetPasswordToken,
} from './types/set-password-token.js';

export const SET_PASSWORD_TOKEN_INDEXES: IndexDescription[] = [
  { key: { token: 1 }, unique: true },
  { key: { org_id: 1 } },
  { key: { expires_at: 1 }, expireAfterSeconds: 0 },
];

@Injectable()
export class SetPasswordTokensRepository implements OnApplicationBootstrap {
  constructor(private readonly database: DatabaseService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.collection.createIndexes(SET_PASSWORD_TOKEN_INDEXES);
  }

  async create(
    input: CreateSetPasswordTokenInput,
  ): Promise<WithId<SetPasswordToken>> {
    const document = prepareSetPasswordToken(input);
    const result = await this.collection.insertOne(document);

    return { ...document, _id: result.insertedId };
  }

  findById(id: ObjectId): Promise<WithId<SetPasswordToken> | null> {
    return this.collection.findOne({ _id: id });
  }

  findByToken(token: string): Promise<WithId<SetPasswordToken> | null> {
    return this.collection.findOne({ token });
  }

  private get collection(): Collection<SetPasswordToken> {
    return this.database
      .getDb()
      .collection<SetPasswordToken>(COLLECTION_NAMES.SET_PASSWORD_TOKENS);
  }
}
