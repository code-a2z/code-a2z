import type { ObjectId } from 'mongodb';

export const ORGANIZATION_MEMBER_ROLES = [
  'owner',
  'admin',
  'member',
  'viewer',
] as const;

export type OrganizationMemberRole = (typeof ORGANIZATION_MEMBER_ROLES)[number];

export interface OrganizationMember {
  user_id: ObjectId;
  org_id: ObjectId;
  role: OrganizationMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationMemberInput {
  user_id: ObjectId;
  org_id: ObjectId;
  role: OrganizationMemberRole;
}
