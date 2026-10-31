import {
  readEnum,
  readObjectId,
  readRecord,
} from '../database/document-validation.js';
import {
  ORGANIZATION_MEMBER_ROLES,
  type CreateOrganizationMemberInput,
  type OrganizationMember,
} from './types/organization-member.js';

export function prepareOrganizationMember(
  input: CreateOrganizationMemberInput,
  now: Date = new Date(),
): OrganizationMember {
  const member = readRecord(input, 'organization_member');

  return {
    user_id: readObjectId(member.user_id, 'user_id'),
    org_id: readObjectId(member.org_id, 'org_id'),
    role: readEnum(member.role, 'role', ORGANIZATION_MEMBER_ROLES),
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}
