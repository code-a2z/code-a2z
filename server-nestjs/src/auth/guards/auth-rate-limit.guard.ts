import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetsAt: number;
}

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, RateLimitEntry>();
  private readonly points: number;
  private readonly windowMs: number;

  constructor(config: ConfigService) {
    this.points = config.getOrThrow<number>('AUTH_RATE_LIMIT_POINTS');
    this.windowMs = config.getOrThrow<number>('AUTH_RATE_LIMIT_WINDOW_MS');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const key = `${context.getHandler().name}:${request.ip ?? request.socket.remoteAddress ?? 'unknown'}`;
    const current = this.attempts.get(key);

    if (!current || current.resetsAt <= now) {
      this.attempts.set(key, { count: 1, resetsAt: now + this.windowMs });
      this.removeExpiredEntries(now);
      return true;
    }

    if (current.count >= this.points) {
      throw new HttpException(
        'Too many authentication attempts',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    return true;
  }

  private removeExpiredEntries(now: number): void {
    if (this.attempts.size < 1_000) {
      return;
    }

    for (const [key, entry] of this.attempts) {
      if (entry.resetsAt <= now) {
        this.attempts.delete(key);
      }
    }
  }
}
