import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard.js';
import { OrgScopedGuard } from '../guards/org-scoped.guard.js';
import { PermissionGuard } from '../guards/permission.guard.js';
import type { Permission } from '../rbac.service.js';
import { REQUIRED_PERMISSION_KEY } from './permission.constants.js';

export const RequirePermission = (permission: Permission) =>
  applyDecorators(
    SetMetadata(REQUIRED_PERMISSION_KEY, permission),
    UseGuards(AccessTokenGuard, OrgScopedGuard, PermissionGuard),
  );
