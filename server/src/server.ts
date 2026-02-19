import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Configs
import connectDB from './config/db';

// Middlewares
import errorHandler from './middlewares/error.handler';
import securityMiddleware from './middlewares/security.middleware';
import sanitizeInput from './middlewares/sanitize.middleware';

// Routes
import monitorRoutes from './routes/api/monitor.routes';
import router from './routes/index';

dotenv.config();

const server: Express = express();

// Middleware
server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// securityMiddleware
securityMiddleware(server);

// sanitizationMiddleware (global)
server.use(sanitizeInput());

// Connect to Database
connectDB();

// Routes
server.get('', (_req: Request, res: Response) =>
  res.status(200).json({ status: 'success', message: 'Backend is running...' })
);

// Monitoring Route
server.use('/monitor', monitorRoutes);

// API Routes
server.use('/api', router);

// Error handler (last middleware)
server.use(errorHandler);

export default server;
