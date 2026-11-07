import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { OrganizationsModule } from '../organizations/organizations.module.js';
import { UsersModule } from '../users/users.module.js';
import { ApiExceptionFilter } from './api-exception.filter.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard.js';
import { OrgScopedGuard } from './guards/org-scoped.guard.js';
import { PermissionGuard } from './guards/permission.guard.js';
import { PreOrgGuard } from './guards/pre-org.guard.js';
import { JwtTokenService } from './jwt-token.service.js';
import { RbacService } from './rbac.service.js';

@Module({
  imports: [UsersModule, OrganizationsModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    RbacService,
    AccessTokenGuard,
    PreOrgGuard,
    OrgScopedGuard,
    PermissionGuard,
    AuthRateLimitGuard,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
  exports: [
    AccessTokenGuard,
    PreOrgGuard,
    OrgScopedGuard,
    PermissionGuard,
    JwtTokenService,
    RbacService,
  ],
})
export class AuthModule {}
