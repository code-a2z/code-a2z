import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  console.log('Logs folder created automatically');
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info): string =>
      `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
  )
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

export default logger;
