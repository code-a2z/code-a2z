import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { ORGANIZATION_FEATURES } from '../organizations/types/organization.js';
import { ORGANIZATION_MEMBER_ROLES } from '../organizations/types/organization-member.js';
import { REFRESH_TOKEN_COOKIE, TOKEN_TYPES } from './auth.constants.js';
import type {
  AccessTokenPayload,
  OrgTokenContext,
  PreOrgTokenPayload,
  TokenIdentity,
} from './auth.types.js';
import { isPermission } from './rbac.service.js';

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: SignOptions['expiresIn'];
  private readonly refreshExpiresIn: SignOptions['expiresIn'];

  constructor(private readonly config: ConfigService) {
    this.accessSecret = config.getOrThrow<string>('JWT_SECRET_ACCESS_KEY');
    this.refreshSecret = config.getOrThrow<string>('JWT_SECRET_REFRESH_KEY');
    this.accessExpiresIn = config.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    ) as SignOptions['expiresIn'];
    this.refreshExpiresIn = config.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as SignOptions['expiresIn'];
  }

  issuePreOrgTokens(payload: TokenIdentity): {
    accessToken: string;
    refreshToken: string;
  } {
    const tokenPayload: PreOrgTokenPayload = {
      ...payload,
      token_type: TOKEN_TYPES.PRE_ORG,
    };

    return {
      accessToken: this.sign(
        tokenPayload,
        this.accessSecret,
        this.accessExpiresIn,
      ),
      refreshToken: this.sign(
        tokenPayload,
        this.refreshSecret,
        this.refreshExpiresIn,
      ),
    };
  }

  issuePreOrgAccessToken(payload: TokenIdentity): string {
    return this.sign(
      { ...payload, token_type: TOKEN_TYPES.PRE_ORG },
      this.accessSecret,
      this.accessExpiresIn,
    );
  }

  issueOrgScopedAccessToken(payload: OrgTokenContext): string {
    return this.sign(
      { ...payload, token_type: TOKEN_TYPES.ORG_SCOPED },
      this.accessSecret,
      this.accessExpiresIn,
    );
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.verify(token, this.accessSecret, false);
  }

  verifyRefreshToken(token: string): PreOrgTokenPayload {
    const payload = this.verify(token, this.refreshSecret, true);
    if (payload.token_type !== TOKEN_TYPES.PRE_ORG) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return payload;
  }

  getRefreshCookieOptions(): CookieOptions {
    const production = this.config.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: production,
      sameSite: production ? 'none' : 'lax',
      path: '/',
      maxAge: this.config.getOrThrow<number>('JWT_REFRESH_COOKIE_MAX_AGE_MS'),
    };
  }

  getClearRefreshCookieOptions(): CookieOptions {
    const { maxAge: _maxAge, ...options } = this.getRefreshCookieOptions();
    return options;
  }

  get refreshCookieName(): string {
    return REFRESH_TOKEN_COOKIE;
  }

  private sign(
    payload: AccessTokenPayload,
    secret: string,
    expiresIn: SignOptions['expiresIn'],
  ): string {
    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn,
    });
  }

  private verify(
    token: string,
    secret: string,
    refresh: boolean,
  ): AccessTokenPayload {
    const errorMessage = refresh
      ? 'Invalid or expired refresh token'
      : 'Access token invalid or expired. Please refresh.';

    try {
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      return parseTokenPayload(decoded);
    } catch {
      throw new UnauthorizedException(errorMessage);
    }
  }
}

function parseTokenPayload(value: string | JwtPayload): AccessTokenPayload {
  if (typeof value === 'string') {
    throw new Error('Invalid JWT payload');
  }

  const userId = readObjectIdString(value.user_id);
  const subscriberId = readObjectIdString(value.subscriber_id);
  const email = value.email;
  if (email !== undefined && typeof email !== 'string') {
    throw new Error('Invalid JWT email');
  }

  if (value.token_type === TOKEN_TYPES.PRE_ORG) {
    return {
      ...value,
      user_id: userId,
      subscriber_id: subscriberId,
      ...(email === undefined ? {} : { email }),
      token_type: TOKEN_TYPES.PRE_ORG,
    };
  }

  if (value.token_type !== TOKEN_TYPES.ORG_SCOPED) {
    throw new Error('Invalid JWT token type');
  }

  const role = value.role;
  const permissions = value.permissions;
  const features = value.org_features;
  if (
    typeof role !== 'string' ||
    !ORGANIZATION_MEMBER_ROLES.includes(
      role as (typeof ORGANIZATION_MEMBER_ROLES)[number],
    ) ||
    !Array.isArray(permissions) ||
    !permissions.every(isPermission) ||
    !Array.isArray(features) ||
    !features.every(
      (feature) =>
        typeof feature === 'string' &&
        ORGANIZATION_FEATURES.includes(
          feature as (typeof ORGANIZATION_FEATURES)[number],
        ),
    )
  ) {
    throw new Error('Invalid org-scoped JWT payload');
  }

  return {
    ...value,
    user_id: userId,
    subscriber_id: subscriberId,
    ...(email === undefined ? {} : { email }),
    token_type: TOKEN_TYPES.ORG_SCOPED,
    org_id: readObjectIdString(value.org_id),
    role: role as OrgTokenContext['role'],
    permissions,
    org_features: features as OrgTokenContext['org_features'],
  };
}

function readObjectIdString(value: unknown): string {
  if (typeof value !== 'string' || !ObjectId.isValid(value)) {
    throw new Error('Invalid JWT ObjectId');
  }
  return new ObjectId(value).toHexString();
}
