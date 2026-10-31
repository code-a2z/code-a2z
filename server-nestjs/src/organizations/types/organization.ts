export const ORGANIZATION_STATUSES = [
  'pending',
  'active',
  'suspended',
  'rejected',
] as const;

export const NEW_ORGANIZATION_STATUSES = [
  'pending',
  'active',
  'suspended',
] as const;

export const ORGANIZATION_FEATURES = [
  'articles',
  'chats',
  'notes',
  'code',
  'collaboration',
  'notifications',
  'feedback',
] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
export type NewOrganizationStatus = (typeof NEW_ORGANIZATION_STATUSES)[number];
export type OrganizationFeature = (typeof ORGANIZATION_FEATURES)[number];

export interface Organization {
  name: string;
  slug: string;
  status: OrganizationStatus;
  requested_by_email?: string;
  requested_by_name?: string;
  enabled_features: OrganizationFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  status?: NewOrganizationStatus;
  requested_by_email?: string;
  requested_by_name?: string;
  enabled_features?: OrganizationFeature[];
}
