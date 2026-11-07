import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { JwtTokenService } from './jwt-token.service.js';

describe('JwtTokenService', () => {
  const accessSecret = 'unit-test-access-secret';
  const refreshSecret = 'unit-test-refresh-secret';
  const userId = new ObjectId().toHexString();
  const subscriberId = new ObjectId().toHexString();
  const identity = {
    user_id: userId,
    subscriber_id: subscriberId,
    email: 'member@example.com',
  };

  const createService = (overrides: Record<string, unknown> = {}) =>
    new JwtTokenService(
      new ConfigService({
        JWT_SECRET_ACCESS_KEY: accessSecret,
        JWT_SECRET_REFRESH_KEY: refreshSecret,
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        JWT_REFRESH_COOKIE_MAX_AGE_MS: 604_800_000,
        NODE_ENV: 'test',
        ...overrides,
      }),
    );

  it('issues and verifies pre-org access and refresh tokens', () => {
    const service = createService();
    const result = service.issuePreOrgTokens(identity);

    expect(service.verifyAccessToken(result.accessToken)).toMatchObject({
      ...identity,
      token_type: 'pre_org',
    });
    expect(service.verifyRefreshToken(result.refreshToken)).toMatchObject({
      ...identity,
      token_type: 'pre_org',
    });
  });

  it('issues and verifies org-scoped access tokens', () => {
    const service = createService();
    const token = service.issueOrgScopedAccessToken({
      ...identity,
      org_id: new ObjectId().toHexString(),
      role: 'member',
      permissions: ['collaboration:read'],
      org_features: ['collaboration'],
    });

    expect(service.verifyAccessToken(token)).toMatchObject({
      token_type: 'org_scoped',
      role: 'member',
      permissions: ['collaboration:read'],
      org_features: ['collaboration'],
    });
  });

  it('does not accept a refresh token as an access token', () => {
    const service = createService();
    const { refreshToken } = service.issuePreOrgTokens(identity);

    expect(() => service.verifyAccessToken(refreshToken)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects invalid and expired access tokens', () => {
    const service = createService();
    const expired = jwt.sign(
      { ...identity, token_type: 'pre_org', exp: 1 },
      accessSecret,
      { algorithm: 'HS256' },
    );

    expect(() => service.verifyAccessToken('not-a-token')).toThrow(
      UnauthorizedException,
    );
    expect(() => service.verifyAccessToken(expired)).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects wrong token types on refresh', () => {
    const service = createService();
    const orgScopedRefresh = jwt.sign(
      {
        ...identity,
        token_type: 'org_scoped',
        org_id: new ObjectId().toHexString(),
        role: 'owner',
        permissions: [],
        org_features: [],
      },
      refreshSecret,
      { algorithm: 'HS256', expiresIn: '1h' },
    );

    expect(() => service.verifyRefreshToken(orgScopedRefresh)).toThrow(
      UnauthorizedException,
    );
  });

  it('uses secure cross-site cookies only in production', () => {
    expect(createService().getRefreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    expect(
      createService({ NODE_ENV: 'production' }).getRefreshCookieOptions(),
    ).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  });
});
