import type { ObjectId } from 'mongodb';

export interface SetPasswordToken {
  token: string;
  email: string;
  org_id: ObjectId;
  expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSetPasswordTokenInput {
  token: string;
  email: string;
  org_id: ObjectId;
  expires_at: Date;
}
