import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sendResponse } from '../utils/response';

const generalLimit = new RateLimiterMemory({
  points: 100,
  duration: 15 * 60,
  blockDuration: 5 * 60,
});

const generalLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  generalLimit
    .consume(req.ip as string)
    .then(() => next())
    .catch(() => sendResponse(res, 429, 'Too many requests'));
};

export default generalLimiter;
