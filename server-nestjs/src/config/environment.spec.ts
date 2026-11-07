import { ObjectId } from 'mongodb';
import { validateEnvironment } from './environment.js';

describe('environment validation', () => {
  const valid = () => ({
    MONGODB_URL: 'mongodb://localhost/test',
    JWT_SECRET_ACCESS_KEY: 'access-secret',
    JWT_SECRET_REFRESH_KEY: 'refresh-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  });

  const validProduction = () => ({
    ...valid(),
    NODE_ENV: 'production',
    CLIENT_ORIGIN: 'https://code-a2z.example',
    JWT_SECRET_ACCESS_KEY: 'a'.repeat(32),
    JWT_SECRET_REFRESH_KEY: 'b'.repeat(32),
  });

  it('requires separate configured JWT secrets', () => {
    expect(() =>
      validateEnvironment({ ...valid(), JWT_SECRET_ACCESS_KEY: '' }),
    ).toThrow('JWT_SECRET_ACCESS_KEY is required');
    expect(() =>
      validateEnvironment({
        ...valid(),
        JWT_SECRET_REFRESH_KEY: 'access-secret',
      }),
    ).toThrow('Access and refresh JWT secrets must be different');
  });

  it('requires an explicit production CORS origin', () => {
    expect(() =>
      validateEnvironment({ ...validProduction(), CLIENT_ORIGIN: '' }),
    ).toThrow('CLIENT_ORIGIN is required in production');
  });

  it('preserves short, distinct secrets for local development and tests', () => {
    expect(validateEnvironment(valid())).toMatchObject({
      JWT_SECRET_ACCESS_KEY: 'access-secret',
      JWT_SECRET_REFRESH_KEY: 'refresh-secret',
    });
  });

  it.each(['JWT_SECRET_ACCESS_KEY', 'JWT_SECRET_REFRESH_KEY'] as const)(
    'requires %s to contain at least 32 characters in production',
    (key) => {
      expect(() =>
        validateEnvironment({ ...validProduction(), [key]: 'too-short' }),
      ).toThrow(`${key} must be at least 32 characters in production`);
    },
  );

  it.each([
    'replace-with-a-long-random-access-secret',
    'this-is-an-example-secret-that-is-not-valid',
    'default_secret_key',
  ])('rejects the production placeholder secret %s', (secret) => {
    expect(() =>
      validateEnvironment({
        ...validProduction(),
        JWT_SECRET_ACCESS_KEY: secret,
      }),
    ).toThrow(
      'JWT_SECRET_ACCESS_KEY must not use a placeholder or default secret',
    );
  });

  it.each(['15m', '1h', '7d', '3600s'])(
    'accepts the explicit positive JWT duration %s',
    (duration) => {
      expect(
        validateEnvironment({
          ...valid(),
          JWT_ACCESS_EXPIRES_IN: duration,
          JWT_REFRESH_EXPIRES_IN: duration,
        }),
      ).toMatchObject({
        JWT_ACCESS_EXPIRES_IN: duration,
        JWT_REFRESH_EXPIRES_IN: duration,
      });
    },
  );

  it.each(['', 'invalid', '0s', '-1h', '3600', '1.5h'])(
    'rejects the invalid access token duration %s',
    (duration) => {
      expect(() =>
        validateEnvironment({
          ...valid(),
          JWT_ACCESS_EXPIRES_IN: duration,
        }),
      ).toThrow();
    },
  );

  it('rejects an invalid refresh token duration', () => {
    expect(() =>
      validateEnvironment({
        ...valid(),
        JWT_REFRESH_EXPIRES_IN: '3600',
      }),
    ).toThrow(
      'JWT_REFRESH_EXPIRES_IN must be a positive duration with an explicit time unit',
    );
  });

  it('validates an optional platform admin organization id', () => {
    expect(() =>
      validateEnvironment({ ...valid(), PLATFORM_ADMIN_ORG_ID: 'invalid' }),
    ).toThrow('PLATFORM_ADMIN_ORG_ID must be a valid MongoDB ObjectId');
    const id = new ObjectId().toHexString();
    expect(
      validateEnvironment({
        ...valid(),
        PLATFORM_ADMIN_ORG_ID: id.toUpperCase(),
      }).PLATFORM_ADMIN_ORG_ID,
    ).toBe(id);
  });
});
