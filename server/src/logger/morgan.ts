import morgan from 'morgan';
import logger from './winston.js';
import dotenv from 'dotenv';

dotenv.config();

const stream = {
  write: (msg: string): void => {
    logger.info(msg.trim());
  },
};

/*
 * Skip function for test environments
 * (Currently not used since we only have 'development' and 'production')
 * Kept for future scalability — useful if automated tests are added later.
 */

const skip = (): boolean => process.env.NODE_ENV === 'test';

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
