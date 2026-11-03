import { ObjectId } from 'mongodb';

const REQUIRED_STRING_KEYS = [
  'MONGODB_URL',
  'JWT_SECRET_ACCESS_KEY',
  'JWT_SECRET_REFRESH_KEY',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
] as const;

const POSITIVE_DURATION_PATTERN = /^[1-9]\d*(?:ms|s|m|h|d|w|y)$/;
const PLACEHOLDER_SECRET_PATTERN =
  /(?:replace[-_ ]with|placeholder|example[-_ ]secret)/i;
const KNOWN_DEFAULT_SECRETS = new Set([
  'secret',
  'changeme',
  'change-me',
  'default_secret_key',
  'default_refresh_secret_key',
  'default-secret-key',
  'default-refresh-secret-key',
]);

export function validateEnvironment(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const config = { ...values };

  for (const key of REQUIRED_STRING_KEYS) {
    config[key] = requireString(config[key], key);
  }

  if (config.JWT_SECRET_ACCESS_KEY === config.JWT_SECRET_REFRESH_KEY) {
    throw new Error('Access and refresh JWT secrets must be different');
  }

  config.JWT_ACCESS_EXPIRES_IN = readPositiveDuration(
    config.JWT_ACCESS_EXPIRES_IN,
    'JWT_ACCESS_EXPIRES_IN',
  );
  config.JWT_REFRESH_EXPIRES_IN = readPositiveDuration(
    config.JWT_REFRESH_EXPIRES_IN,
    'JWT_REFRESH_EXPIRES_IN',
  );

  const nodeEnvironment = readOptionalString(config.NODE_ENV) ?? 'development';
  const clientOrigin = readOptionalString(config.CLIENT_ORIGIN);

  if (nodeEnvironment === 'production') {
    validateProductionJwtSecret(
      config.JWT_SECRET_ACCESS_KEY,
      'JWT_SECRET_ACCESS_KEY',
    );
    validateProductionJwtSecret(
      config.JWT_SECRET_REFRESH_KEY,
      'JWT_SECRET_REFRESH_KEY',
    );

    if (!clientOrigin) {
      throw new Error('CLIENT_ORIGIN is required in production');
    }
  }

  config.NODE_ENV = nodeEnvironment;
  config.CLIENT_ORIGIN = clientOrigin ?? 'http://localhost:5173';
  config.JWT_REFRESH_COOKIE_MAX_AGE_MS = readPositiveInteger(
    config.JWT_REFRESH_COOKIE_MAX_AGE_MS,
    'JWT_REFRESH_COOKIE_MAX_AGE_MS',
    7 * 24 * 60 * 60 * 1000,
  );
  config.AUTH_RATE_LIMIT_POINTS = readPositiveInteger(
    config.AUTH_RATE_LIMIT_POINTS,
    'AUTH_RATE_LIMIT_POINTS',
    10,
  );
  config.AUTH_RATE_LIMIT_WINDOW_MS = readPositiveInteger(
    config.AUTH_RATE_LIMIT_WINDOW_MS,
    'AUTH_RATE_LIMIT_WINDOW_MS',
    15 * 60 * 1000,
  );

  const platformAdminOrganizationId = readOptionalString(
    config.PLATFORM_ADMIN_ORG_ID,
  );
  if (
    platformAdminOrganizationId &&
    !ObjectId.isValid(platformAdminOrganizationId)
  ) {
    throw new Error('PLATFORM_ADMIN_ORG_ID must be a valid MongoDB ObjectId');
  }
  config.PLATFORM_ADMIN_ORG_ID = platformAdminOrganizationId
    ? new ObjectId(platformAdminOrganizationId).toHexString()
    : undefined;

  return config;
}

function requireString(value: unknown, key: string): string {
  const result = readOptionalString(value);
  if (!result) {
    throw new Error(`${key} is required`);
  }
  return result;
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const result = value.trim();
  return result.length === 0 ? undefined : result;
}

function readPositiveInteger(
  value: unknown,
  key: string,
  fallback: number,
): number {
  if (value === undefined || value === '') {
    return fallback;
  }

  const result = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(result) || result <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }

  return result;
}

function readPositiveDuration(value: unknown, key: string): string {
  const duration = requireString(value, key);

  if (!POSITIVE_DURATION_PATTERN.test(duration)) {
    throw new Error(
      `${key} must be a positive duration with an explicit time unit`,
    );
  }

  return duration;
}

function validateProductionJwtSecret(value: unknown, key: string): void {
  const secret = requireString(value, key);
  const normalizedSecret = secret.toLowerCase();

  if (
    PLACEHOLDER_SECRET_PATTERN.test(secret) ||
    KNOWN_DEFAULT_SECRETS.has(normalizedSecret)
  ) {
    throw new Error(`${key} must not use a placeholder or default secret`);
  }

  if (secret.length < 32) {
    throw new Error(`${key} must be at least 32 characters in production`);
  }
}
