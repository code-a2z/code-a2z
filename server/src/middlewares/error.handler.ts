import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack || err.message);
  if (res.headersSent) {
    next(err);
    return;
  }

  sendResponse(res, 500, err.message || 'Internal Server Error');
};

export default errorHandler;
