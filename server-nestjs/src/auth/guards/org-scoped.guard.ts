import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { OrganizationMembersRepository } from '../../organizations/organization-members.repository.js';
import { OrganizationsRepository } from '../../organizations/organizations.repository.js';
import { AuthService } from '../auth.service.js';
import { TOKEN_TYPES } from '../auth.constants.js';
import type {
  AuthenticatedRequest,
  OrgScopedTokenPayload,
} from '../auth.types.js';
import { RbacService } from '../rbac.service.js';
import { markLiveAuthorizationVerified } from './live-authorization.js';

@Injectable()
export class OrgScopedGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly organizationMembers: OrganizationMembersRepository,
    private readonly organizations: OrganizationsRepository,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const payload = request.user;
    if (!payload) {
      throw new UnauthorizedException('Authentication required');
    }
    if (payload.token_type !== TOKEN_TYPES.ORG_SCOPED || !payload.org_id) {
      throw new ForbiddenException(
        'Organization context required. Call select-org first.',
      );
    }

    const { user } = await this.auth.validateUserContext(payload);
    const organizationId = new ObjectId(payload.org_id);
    const [membership, organization] = await Promise.all([
      this.organizationMembers.findByUserAndOrganization(
        user._id,
        organizationId,
      ),
      this.organizations.findById(organizationId),
    ]);

    if (!membership || !organization || organization.status !== 'active') {
      throw new ForbiddenException(
        'Organization membership is no longer active',
      );
    }

    request.user = this.withCurrentAuthorization(
      payload,
      membership.role,
      organization.enabled_features,
    );
    markLiveAuthorizationVerified(request);
    return true;
  }

  private withCurrentAuthorization(
    payload: OrgScopedTokenPayload,
    role: OrgScopedTokenPayload['role'],
    features: OrgScopedTokenPayload['org_features'],
  ): OrgScopedTokenPayload {
    return {
      ...payload,
      role,
      permissions: this.rbac.getPermissions(role, features, payload.org_id),
      org_features: features,
    };
  }
}
