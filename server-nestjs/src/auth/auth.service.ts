import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ObjectId, type WithId } from 'mongodb';
import { OrganizationMembersRepository } from '../organizations/organization-members.repository.js';
import { OrganizationsRepository } from '../organizations/organizations.repository.js';
import type { Organization } from '../organizations/types/organization.js';
import type { OrganizationMember } from '../organizations/types/organization-member.js';
import { SubscribersRepository } from '../users/subscribers.repository.js';
import type { Subscriber } from '../users/types/subscriber.js';
import type { User } from '../users/types/user.js';
import { UsersRepository } from '../users/users.repository.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SelectOrganizationDto } from './dto/select-organization.dto.js';
import type {
  AccessTokenPayload,
  LimitedUser,
  OrganizationMembershipSummary,
  PreOrgTokenPayload,
  TokenIdentity,
} from './auth.types.js';
import { JwtTokenService } from './jwt-token.service.js';
import { RbacService } from './rbac.service.js';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
const DUMMY_PASSWORD_HASH =
  '$2b$10$Izrni9b2dMSZiePqSeiCwOStyNhgl.igLjRJBxJb83MHHrwbTZ1D.';

interface UserContext {
  user: WithId<User>;
  subscriber: WithId<Subscriber>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly subscribers: SubscribersRepository,
    private readonly organizationMembers: OrganizationMembersRepository,
    private readonly organizations: OrganizationsRepository,
    private readonly tokens: JwtTokenService,
    private readonly rbac: RbacService,
  ) {}

  async login(dto: LoginDto): Promise<{
    refreshToken: string;
    data: {
      user: LimitedUser;
      orgs: OrganizationMembershipSummary[];
      access_token: string;
    };
  }> {
    const subscriber = await this.subscribers.findByEmail(dto.email);
    const user = subscriber
      ? await this.users.findBySubscriberId(subscriber._id)
      : null;
    const passwordHash = user?.personal_info.password ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = await bcrypt
      .compare(dto.password, passwordHash)
      .catch(() => false);

    if (!subscriber || !user || !passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const orgs = await this.listActiveMemberships(user._id);
    const identity = this.createTokenIdentity(user, subscriber);
    const { accessToken, refreshToken } =
      this.tokens.issuePreOrgTokens(identity);

    return {
      refreshToken,
      data: {
        user: this.toLimitedUser(user, subscriber),
        orgs,
        access_token: accessToken,
      },
    };
  }

  async refresh(refreshToken: string | undefined): Promise<{
    access_token: string;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const { user, subscriber } = await this.validateUserContext(payload);

    return {
      access_token: this.tokens.issuePreOrgAccessToken(
        this.createTokenIdentity(user, subscriber),
      ),
    };
  }

  async session(payload: AccessTokenPayload): Promise<{
    user: LimitedUser;
    orgs: OrganizationMembershipSummary[];
  }> {
    const { user, subscriber } = await this.validateUserContext(payload);
    const orgs = await this.listActiveMemberships(user._id);

    return {
      user: this.toLimitedUser(user, subscriber),
      orgs,
    };
  }

  async selectOrganization(
    payload: PreOrgTokenPayload,
    dto: SelectOrganizationDto,
  ): Promise<{
    access_token: string;
    user: LimitedUser;
    role: OrganizationMember['role'];
    permissions: ReturnType<RbacService['getPermissions']>;
    org_features: Organization['enabled_features'];
    org: { org_id: string; name: string; slug: string };
  }> {
    const organizationId = parseObjectId(dto.org_id, 'org_id');
    const { user, subscriber } = await this.validateUserContext(payload);
    const [membership, organization] = await Promise.all([
      this.organizationMembers.findByUserAndOrganization(
        user._id,
        organizationId,
      ),
      this.organizations.findById(organizationId),
    ]);

    if (!membership || !organization) {
      throw new ForbiddenException('You are not a member of this organization');
    }
    if (organization.status !== 'active') {
      throw new ForbiddenException(
        'This organization is not available for access',
      );
    }

    const orgId = organization._id.toHexString();
    const permissions = this.rbac.getPermissions(
      membership.role,
      organization.enabled_features,
      orgId,
    );
    const accessToken = this.tokens.issueOrgScopedAccessToken({
      ...this.createTokenIdentity(user, subscriber),
      org_id: orgId,
      role: membership.role,
      permissions,
      org_features: organization.enabled_features,
    });

    return {
      access_token: accessToken,
      user: this.toLimitedUser(user, subscriber),
      role: membership.role,
      permissions,
      org_features: organization.enabled_features,
      org: {
        org_id: orgId,
        name: organization.name,
        slug: organization.slug,
      },
    };
  }

  async changePassword(
    payload: AccessTokenPayload,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const { user } = await this.validateUserContext(payload);
    const matches = await bcrypt
      .compare(dto.current_password, user.personal_info.password)
      .catch(() => false);

    if (!matches) {
      throw new ForbiddenException('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(dto.new_password, 10);
    const updated = await this.users.updatePassword(user._id, hashedPassword);
    if (!updated) {
      throw new UnauthorizedException('Authenticated user no longer exists');
    }
  }

  async validateUserContext(payload: TokenIdentity): Promise<UserContext> {
    const userId = parseTokenObjectId(payload.user_id);
    const subscriberId = parseTokenObjectId(payload.subscriber_id);
    const [user, subscriber] = await Promise.all([
      this.users.findById(userId),
      this.subscribers.findById(subscriberId),
    ]);

    if (
      !user ||
      !subscriber ||
      !user.personal_info.subscriber_id.equals(subscriber._id) ||
      (payload.email !== undefined && payload.email !== subscriber.email)
    ) {
      throw new UnauthorizedException('Invalid authenticated user context');
    }

    return { user, subscriber };
  }

  private async listActiveMemberships(
    userId: ObjectId,
  ): Promise<OrganizationMembershipSummary[]> {
    const memberships = await this.organizationMembers.findByUserId(userId);
    const organizations = await this.organizations.findByIds(
      memberships.map((membership) => membership.org_id),
    );
    const organizationsById = new Map(
      organizations.map((organization) => [
        organization._id.toHexString(),
        organization,
      ]),
    );

    return memberships.flatMap((membership) => {
      const organization = organizationsById.get(
        membership.org_id.toHexString(),
      );
      if (!organization || organization.status !== 'active') {
        return [];
      }

      return [
        {
          org_id: organization._id.toHexString(),
          name: organization.name,
          role: membership.role,
        },
      ];
    });
  }

  private createTokenIdentity(
    user: WithId<User>,
    subscriber: WithId<Subscriber>,
  ): TokenIdentity {
    return {
      user_id: user._id.toHexString(),
      subscriber_id: subscriber._id.toHexString(),
      email: subscriber.email,
    };
  }

  private toLimitedUser(
    user: WithId<User>,
    subscriber: WithId<Subscriber>,
  ): LimitedUser {
    return {
      id: user._id.toHexString(),
      fullname: user.personal_info.fullname,
      username: user.personal_info.username,
      email: subscriber.email,
      profile_img: user.personal_info.profile_img,
    };
  }
}

function parseObjectId(value: string, field: string): ObjectId {
  if (!ObjectId.isValid(value)) {
    throw new BadRequestException(`${field} must be a valid MongoDB ObjectId`);
  }
  return new ObjectId(value);
}

function parseTokenObjectId(value: string): ObjectId {
  if (!ObjectId.isValid(value)) {
    throw new UnauthorizedException('Invalid authenticated user context');
  }
  return new ObjectId(value);
}
