import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSION_KEY } from '../decorators/permission.constants.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import type { Permission } from '../rbac.service.js';
import { hasLiveAuthorizationBeenVerified } from './live-authorization.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!hasLiveAuthorizationBeenVerified(request)) {
      throw new ForbiddenException(
        'Live organization authorization has not been verified',
      );
    }

    const permissions =
      request.user?.token_type === 'org_scoped' ? request.user.permissions : [];
    if (!permissions.includes(requiredPermission)) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }
    return true;
  }
}
