import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import type { OrganizationMembersRepository } from '../organizations/organization-members.repository.js';
import type { OrganizationsRepository } from '../organizations/organizations.repository.js';
import type { Organization } from '../organizations/types/organization.js';
import type { OrganizationMember } from '../organizations/types/organization-member.js';
import type { SubscribersRepository } from '../users/subscribers.repository.js';
import type { Subscriber } from '../users/types/subscriber.js';
import type { User } from '../users/types/user.js';
import type { UsersRepository } from '../users/users.repository.js';
import { AuthService } from './auth.service.js';
import type { JwtTokenService } from './jwt-token.service.js';
import { PERMISSIONS, type RbacService } from './rbac.service.js';

describe('AuthService', () => {
  const userId = new ObjectId();
  const subscriberId = new ObjectId();
  const organizationId = new ObjectId();
  let passwordHash: string;

  const users = {
    findById: vi.fn(),
    findBySubscriberId: vi.fn(),
    updatePassword: vi.fn(),
  };
  const subscribers = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };
  const organizationMembers = {
    findByUserId: vi.fn(),
    findByUserAndOrganization: vi.fn(),
  };
  const organizations = {
    findByIds: vi.fn(),
    findById: vi.fn(),
  };
  const tokens = {
    issuePreOrgTokens: vi.fn(),
    issuePreOrgAccessToken: vi.fn(),
    issueOrgScopedAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };
  const rbac = {
    getPermissions: vi.fn(),
  };

  const subscriber = (): Subscriber & { _id: ObjectId } => ({
    _id: subscriberId,
    email: 'member@example.com',
    is_subscribed: true,
    subscribed_at: new Date(),
    unsubscribed_at: null,
    joinedAt: new Date(),
    updatedAt: new Date(),
  });

  const user = (): User & { _id: ObjectId } => ({
    _id: userId,
    personal_info: {
      fullname: 'Test Member',
      subscriber_id: subscriberId,
      password: passwordHash,
      username: 'testmember',
      bio: '',
      profile_img: 'https://example.com/avatar.svg',
    },
    social_links: {
      youtube: '',
      instagram: '',
      facebook: '',
      x: '',
      github: '',
      linkedin: '',
      website: '',
    },
    account_info: { total_posts: 0, total_reads: 0 },
    role: 'user',
    project_ids: [],
    collaborated_project_ids: [],
    collection_ids: [],
    joinedAt: new Date(),
    updatedAt: new Date(),
  });

  const membership = (
    orgId = organizationId,
    role: OrganizationMember['role'] = 'member',
  ): OrganizationMember & { _id: ObjectId } => ({
    _id: new ObjectId(),
    user_id: userId,
    org_id: orgId,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const organization = (
    status: Organization['status'] = 'active',
    id = organizationId,
  ): Organization & { _id: ObjectId } => ({
    _id: id,
    name: 'Test Organization',
    slug: 'test-organization',
    status,
    enabled_features: ['articles'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createService = () =>
    new AuthService(
      users as unknown as UsersRepository,
      subscribers as unknown as SubscribersRepository,
      organizationMembers as unknown as OrganizationMembersRepository,
      organizations as unknown as OrganizationsRepository,
      tokens as unknown as JwtTokenService,
      rbac as unknown as RbacService,
    );

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Valid123', 4);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    users.findById.mockResolvedValue(user());
    users.findBySubscriberId.mockResolvedValue(user());
    users.updatePassword.mockResolvedValue(true);
    subscribers.findByEmail.mockResolvedValue(subscriber());
    subscribers.findById.mockResolvedValue(subscriber());
    organizationMembers.findByUserId.mockResolvedValue([]);
    organizationMembers.findByUserAndOrganization.mockResolvedValue(
      membership(),
    );
    organizations.findByIds.mockResolvedValue([]);
    organizations.findById.mockResolvedValue(organization());
    tokens.issuePreOrgTokens.mockReturnValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    tokens.issuePreOrgAccessToken.mockReturnValue('new-access-token');
    tokens.issueOrgScopedAccessToken.mockReturnValue('org-access-token');
    tokens.verifyRefreshToken.mockReturnValue({
      user_id: userId.toHexString(),
      subscriber_id: subscriberId.toHexString(),
      email: 'member@example.com',
      token_type: 'pre_org',
    });
    rbac.getPermissions.mockReturnValue([PERMISSIONS.ARTICLES_READ]);
  });

  it('logs in successfully without requiring an organization', async () => {
    const result = await createService().login({
      email: 'member@example.com',
      password: 'Valid123',
    });

    expect(result.data.orgs).toEqual([]);
    expect(result.data.access_token).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.data.user).toEqual({
      id: userId.toHexString(),
      fullname: 'Test Member',
      username: 'testmember',
      email: 'member@example.com',
      profile_img: 'https://example.com/avatar.svg',
    });
    expect(JSON.stringify(result)).not.toContain(passwordHash);
  });

  it.each([
    ['wrong password', () => undefined, 'Wrong123'],
    [
      'missing subscriber',
      () => subscribers.findByEmail.mockResolvedValueOnce(null),
      'Valid123',
    ],
    [
      'missing user',
      () => users.findBySubscriberId.mockResolvedValueOnce(null),
      'Valid123',
    ],
  ])('returns the same error for %s', async (_case, arrange, password) => {
    arrange();

    await expect(
      createService().login({ email: 'member@example.com', password }),
    ).rejects.toMatchObject({
      constructor: UnauthorizedException,
      message: 'Invalid email or password',
    });
  });

  it('returns only active memberships for a session', async () => {
    const ids = [
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
      new ObjectId(),
    ];
    organizationMembers.findByUserId.mockResolvedValue(
      ids.map((id) => membership(id)),
    );
    organizations.findByIds.mockResolvedValue([
      organization('active', ids[0]),
      organization('pending', ids[1]),
      organization('suspended', ids[2]),
      organization('rejected', ids[3]),
    ]);

    const result = await createService().session({
      user_id: userId.toHexString(),
      subscriber_id: subscriberId.toHexString(),
      token_type: 'pre_org',
    });

    expect(result.orgs).toEqual([
      {
        org_id: ids[0].toHexString(),
        name: 'Test Organization',
        role: 'member',
      },
    ]);
  });

  it('refreshes only after verifying current user context', async () => {
    const result = await createService().refresh('refresh-token');

    expect(tokens.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(users.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual({ access_token: 'new-access-token' });
  });

  it('selects an active organization using the stored membership role', async () => {
    organizationMembers.findByUserAndOrganization.mockResolvedValue(
      membership(organizationId, 'viewer'),
    );

    const result = await createService().selectOrganization(
      {
        user_id: userId.toHexString(),
        subscriber_id: subscriberId.toHexString(),
        token_type: 'pre_org',
      },
      { org_id: organizationId.toHexString() },
    );

    expect(rbac.getPermissions).toHaveBeenCalledWith(
      'viewer',
      ['articles'],
      organizationId.toHexString(),
    );
    expect(tokens.issueOrgScopedAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'viewer',
        permissions: [PERMISSIONS.ARTICLES_READ],
      }),
    );
    expect(result.role).toBe('viewer');
  });

  it('rejects organization selection without a membership', async () => {
    organizationMembers.findByUserAndOrganization.mockResolvedValue(null);

    await expect(
      createService().selectOrganization(
        {
          user_id: userId.toHexString(),
          subscriber_id: subscriberId.toHexString(),
          token_type: 'pre_org',
        },
        { org_id: organizationId.toHexString() },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it.each(['pending', 'suspended', 'rejected'] as const)(
    'rejects selection of a %s organization',
    async (status) => {
      organizations.findById.mockResolvedValue(organization(status));

      await expect(
        createService().selectOrganization(
          {
            user_id: userId.toHexString(),
            subscriber_id: subscriberId.toHexString(),
            token_type: 'pre_org',
          },
          { org_id: organizationId.toHexString() },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    },
  );

  it('changes only the authenticated user password', async () => {
    await createService().changePassword(
      {
        user_id: userId.toHexString(),
        subscriber_id: subscriberId.toHexString(),
        token_type: 'pre_org',
      },
      { current_password: 'Valid123', new_password: 'Changed123' },
    );

    expect(users.updatePassword).toHaveBeenCalledOnce();
    expect(users.updatePassword.mock.calls[0][0]).toEqual(userId);
    expect(users.updatePassword.mock.calls[0][1]).not.toBe('Changed123');
    await expect(
      bcrypt.compare('Changed123', users.updatePassword.mock.calls[0][1]),
    ).resolves.toBe(true);
  });

  it('rejects an incorrect current password', async () => {
    await expect(
      createService().changePassword(
        {
          user_id: userId.toHexString(),
          subscriber_id: subscriberId.toHexString(),
          token_type: 'pre_org',
        },
        { current_password: 'Wrong123', new_password: 'Changed123' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(users.updatePassword).not.toHaveBeenCalled();
  });
});
