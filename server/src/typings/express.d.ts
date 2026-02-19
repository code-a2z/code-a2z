import { Logger } from 'winston';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      logger?: Logger;
    }
  }
}

export {};
