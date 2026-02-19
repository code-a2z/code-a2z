import { Express, Request, Response, NextFunction } from 'express';
import morganMiddleware from '../logger/morgan.js';
import logger from '../logger/winston.js';

const loggingMiddleware = (app: Express): void => {
  app.use(morganMiddleware);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.logger = logger;
    next();
  });
};

export default loggingMiddleware;
