import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants.js';
import type { AuthenticatedRequest } from '../auth.types.js';
import { JwtTokenService } from '../jwt-token.service.js';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokens: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token =
      readBearerToken(request) ?? request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedException(
        'Access Denied: No access token provided',
      );
    }

    request.user = this.tokens.verifyAccessToken(token);
    return true;
  }
}

function readBearerToken(request: AuthenticatedRequest): string | undefined {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return undefined;
  }

  const [scheme, token, extra] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token || extra) {
    throw new UnauthorizedException('Invalid Authorization header');
  }
  return token;
}
