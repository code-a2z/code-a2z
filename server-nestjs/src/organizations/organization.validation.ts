import {
  DocumentValidationError,
  readEnum,
  readOptionalString,
  readRecord,
  readString,
} from '../database/document-validation.js';
import {
  NEW_ORGANIZATION_STATUSES,
  ORGANIZATION_FEATURES,
  type CreateOrganizationInput,
  type Organization,
  type OrganizationFeature,
} from './types/organization.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function prepareOrganization(
  input: CreateOrganizationInput,
  now: Date = new Date(),
): Organization {
  const organization = readRecord(input, 'organization');
  const requestedByEmail = readOptionalString(
    organization.requested_by_email,
    'requested_by_email',
    { lowercase: true, trim: true },
  );
  const requestedByName = readOptionalString(
    organization.requested_by_name,
    'requested_by_name',
    { trim: true },
  );

  return {
    name: readString(organization.name, 'name', {
      maxLength: 120,
      trim: true,
    }),
    slug: readString(organization.slug, 'slug', {
      lowercase: true,
      pattern: SLUG_PATTERN,
      trim: true,
    }),
    status:
      organization.status === undefined
        ? 'pending'
        : readEnum(organization.status, 'status', NEW_ORGANIZATION_STATUSES),
    ...(requestedByEmail === undefined
      ? {}
      : { requested_by_email: requestedByEmail }),
    ...(requestedByName === undefined
      ? {}
      : { requested_by_name: requestedByName }),
    enabled_features:
      organization.enabled_features === undefined
        ? [...ORGANIZATION_FEATURES]
        : readFeatures(organization.enabled_features),
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

function readFeatures(value: unknown): OrganizationFeature[] {
  if (!Array.isArray(value)) {
    throw new DocumentValidationError('enabled_features', 'must be an array');
  }

  return value.map((feature, index) =>
    readEnum(feature, `enabled_features.${index}`, ORGANIZATION_FEATURES),
  );
}
