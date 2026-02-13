import { RateLimiterMemory } from 'rate-limiter-flexible';
import { sendResponse } from '../utils/response.js';

const authLimit = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
  blockDuration: 15 * 60,
});

const authLimiter = (req, res, next) => {
  authLimit
    .consume(req.ip)
    .then(() => next())
    .catch(() => sendResponse(res, 429, 'Too many requests to /auth'));
};

export default authLimiter;




















