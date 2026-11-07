import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_TYPES } from '../auth.constants.js';
import type { AuthenticatedRequest } from '../auth.types.js';

@Injectable()
export class PreOrgGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    if (request.user.token_type !== TOKEN_TYPES.PRE_ORG) {
      throw new ForbiddenException(
        'This endpoint requires pre-org token. Use login or refresh token.',
      );
    }
    return true;
  }
}
