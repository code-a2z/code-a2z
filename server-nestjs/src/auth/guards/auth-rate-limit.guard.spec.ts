import { HttpException, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRateLimitGuard } from './auth-rate-limit.guard.js';

describe('AuthRateLimitGuard', () => {
  it('blocks requests after the configured number of attempts', () => {
    const guard = new AuthRateLimitGuard(
      new ConfigService({
        AUTH_RATE_LIMIT_POINTS: 2,
        AUTH_RATE_LIMIT_WINDOW_MS: 60_000,
      }),
    );
    const handler = function login() {};
    const context = {
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => ({ ip: '127.0.0.1', socket: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(() => guard.canActivate(context)).toThrow(HttpException);

    try {
      guard.canActivate(context);
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(429);
    }
  });
});
