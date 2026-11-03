import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SelectOrganizationDto } from './dto/select-organization.dto.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard.js';
import { PreOrgGuard } from './guards/pre-org.guard.js';
import { JwtTokenService } from './jwt-token.service.js';

@Controller(['api/v1/auth', 'api/auth'])
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: JwtTokenService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRateLimitGuard)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto);
    response.cookie(
      this.tokens.refreshCookieName,
      result.refreshToken,
      this.tokens.getRefreshCookieOptions(),
    );

    return success('Login successful', result.data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: AuthenticatedRequest) {
    const data = await this.auth.refresh(
      request.cookies?.[this.tokens.refreshCookieName],
    );
    return success('Access token refreshed successfully', data);
  }

  @Get('session')
  @UseGuards(AccessTokenGuard)
  async session(@Req() request: AuthenticatedRequest) {
    const data = await this.auth.session(getAuthenticatedUser(request));
    return success('Session', data);
  }

  @Post('select-org')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, PreOrgGuard)
  async selectOrganization(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SelectOrganizationDto,
  ) {
    const payload = getAuthenticatedUser(request);
    if (payload.token_type !== 'pre_org') {
      throw new UnauthorizedException('Pre-org authentication required');
    }

    const data = await this.auth.selectOrganization(payload, dto);
    return success('Organization selected', data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      this.tokens.refreshCookieName,
      this.tokens.getClearRefreshCookieOptions(),
    );

    return success('Logged out successfully', {
      client_clear_hint: {
        clear_access_token: true,
        clear_selected_org_id: true,
      },
    });
  }

  @Patch('change-password')
  @UseGuards(AuthRateLimitGuard, AccessTokenGuard)
  async changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.auth.changePassword(getAuthenticatedUser(request), dto);
    return success('Password changed successfully');
  }
}

function getAuthenticatedUser(request: AuthenticatedRequest) {
  if (!request.user) {
    throw new UnauthorizedException('Authentication required');
  }
  return request.user;
}

function success<T>(message: string, data?: T) {
  return {
    status: 'success' as const,
    message,
    ...(data === undefined ? {} : { data }),
  };
}
