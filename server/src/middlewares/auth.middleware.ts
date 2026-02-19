import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendResponse } from '../utils/response';
import { COOKIE_TOKEN } from '../typings';
import { JWT_SECRET_ACCESS_KEY } from '../config/env';

const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.headers['authorization']?.split(' ')[1] ||
    req.cookies?.[COOKIE_TOKEN.ACCESS_TOKEN];

  if (!token) {
    sendResponse(res, 401, 'Access Denied: No access token provided');
    return;
  }

  try {
    jwt.verify(
      token,
      JWT_SECRET_ACCESS_KEY,
      (
        err: jwt.VerifyErrors | null,
        decoded: string | JwtPayload | undefined
      ) => {
        if (err) {
          sendResponse(
            res,
            401,
            'Access token invalid or expired. Please refresh.'
          );
          return;
        }
        if (typeof decoded !== 'string') {
          req.user = decoded as JwtPayload & {
            user_id: string;
            subscriber_id: string;
          };
        }
        next();
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Token verification failed';
    sendResponse(res, 500, message);
  }
};

export default authenticateUser;
