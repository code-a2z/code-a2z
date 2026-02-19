import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        user_id: string;
        subscriber_id: string;
      };
      logger?: Logger;
    }
  }
}

export {};
