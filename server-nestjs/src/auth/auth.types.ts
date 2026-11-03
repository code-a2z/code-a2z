import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { OrganizationFeature } from '../organizations/types/organization.js';
import type { OrganizationMemberRole } from '../organizations/types/organization-member.js';
import type { Permission } from './rbac.service.js';

export interface TokenIdentity {
  user_id: string;
  subscriber_id: string;
  email?: string;
}

interface BaseTokenPayload extends JwtPayload, TokenIdentity {}

export interface PreOrgTokenPayload extends BaseTokenPayload {
  token_type: 'pre_org';
}

export interface OrgScopedTokenPayload extends BaseTokenPayload {
  token_type: 'org_scoped';
  org_id: string;
  role: OrganizationMemberRole;
  permissions: Permission[];
  org_features: OrganizationFeature[];
}

export type AccessTokenPayload = PreOrgTokenPayload | OrgScopedTokenPayload;

export interface OrgTokenContext extends TokenIdentity {
  org_id: string;
  role: OrganizationMemberRole;
  permissions: Permission[];
  org_features: OrganizationFeature[];
}

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
  cookies: Record<string, string | undefined>;
}

export interface LimitedUser {
  id: string;
  fullname?: string;
  username?: string;
  email?: string;
  profile_img?: string;
}

export interface OrganizationMembershipSummary {
  org_id: string;
  name: string;
  role: OrganizationMemberRole;
}
