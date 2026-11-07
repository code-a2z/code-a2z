import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../auth.types.js';
import { PERMISSIONS } from '../rbac.service.js';
import { markLiveAuthorizationVerified } from './live-authorization.js';
import { PermissionGuard } from './permission.guard.js';

describe('PermissionGuard', () => {
  let request: AuthenticatedRequest;
  const context = {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    reflector.getAllAndOverride.mockReturnValue(PERMISSIONS.COLLABORATION_READ);
    request = {
      headers: { 'x-live-authorization-verified': 'true' },
      body: { liveAuthorizationVerified: true },
      user: {
        token_type: 'org_scoped',
        permissions: [PERMISSIONS.COLLABORATION_READ],
        liveAuthorizationVerified: true,
      },
    } as unknown as AuthenticatedRequest;
  });

  it('rejects stale JWT permissions without live authorization verification', () => {
    const guard = new PermissionGuard(reflector as unknown as Reflector);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows a permission after the org-scoped guard verifies the request', () => {
    markLiveAuthorizationVerified(request);
    const guard = new PermissionGuard(reflector as unknown as Reflector);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a missing permission', () => {
    markLiveAuthorizationVerified(request);
    reflector.getAllAndOverride.mockReturnValue(PERMISSIONS.COLLABORATION_WRITE);
    const guard = new PermissionGuard(reflector as unknown as Reflector);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
