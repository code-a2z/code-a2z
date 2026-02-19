import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sendResponse } from '../utils/response';

const authLimit = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

const authLimiter = (req: Request, res: Response, next: NextFunction): void => {
  authLimit
    .consume(req.ip as string)
    .then(() => next())
    .catch(() => sendResponse(res, 429, 'Too many requests to /auth'));
};

export default authLimiter;
