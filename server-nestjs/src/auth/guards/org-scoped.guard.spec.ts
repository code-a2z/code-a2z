import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import type { OrganizationMembersRepository } from '../../organizations/organization-members.repository.js';
import type { OrganizationsRepository } from '../../organizations/organizations.repository.js';
import type { AuthService } from '../auth.service.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import { PERMISSIONS, type RbacService } from '../rbac.service.js';
import { hasLiveAuthorizationBeenVerified } from './live-authorization.js';
import { OrgScopedGuard } from './org-scoped.guard.js';

describe('OrgScopedGuard', () => {
  const userId = new ObjectId();
  const subscriberId = new ObjectId();
  const organizationId = new ObjectId();
  let request: AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const auth = {
    validateUserContext: vi.fn().mockResolvedValue({
      user: { _id: userId },
      subscriber: { _id: subscriberId },
    }),
  };
  const members = {
    findByUserAndOrganization: vi.fn(),
  };
  const organizations = {
    findById: vi.fn(),
  };
  const rbac = {
    getPermissions: vi.fn().mockReturnValue([PERMISSIONS.ARTICLES_READ]),
  };

  const createGuard = () =>
    new OrgScopedGuard(
      auth as unknown as AuthService,
      members as unknown as OrganizationMembersRepository,
      organizations as unknown as OrganizationsRepository,
      rbac as unknown as RbacService,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    request = {
      user: {
        user_id: userId.toHexString(),
        subscriber_id: subscriberId.toHexString(),
        token_type: 'org_scoped',
        org_id: organizationId.toHexString(),
        role: 'owner',
        permissions: [PERMISSIONS.ORG_MANAGE],
        org_features: ['articles'],
      },
    } as unknown as AuthenticatedRequest;
    members.findByUserAndOrganization.mockResolvedValue({ role: 'viewer' });
    organizations.findById.mockResolvedValue({
      status: 'active',
      enabled_features: ['articles'],
    });
  });

  it('replaces stale token authorization with current database state', async () => {
    await expect(createGuard().canActivate(context)).resolves.toBe(true);

    expect(request.user).toMatchObject({
      role: 'viewer',
      permissions: [PERMISSIONS.ARTICLES_READ],
      org_features: ['articles'],
    });
    expect(rbac.getPermissions).toHaveBeenCalledWith(
      'viewer',
      ['articles'],
      organizationId.toHexString(),
    );
    expect(hasLiveAuthorizationBeenVerified(request)).toBe(true);
  });

  it.each(['pending', 'suspended', 'rejected'])(
    'rejects a membership when the organization becomes %s',
    async (status) => {
      organizations.findById.mockResolvedValue({
        status,
        enabled_features: ['articles'],
      });

      await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(hasLiveAuthorizationBeenVerified(request)).toBe(false);
    },
  );

  it('rejects a removed membership', async () => {
    members.findByUserAndOrganization.mockResolvedValue(null);

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(hasLiveAuthorizationBeenVerified(request)).toBe(false);
  });
});
