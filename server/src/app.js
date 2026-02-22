/**
 * Express app (middleware + routes). No DB connection.
 * Used by server.js for the running server and by tests with supertest.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import errorHandler from './middlewares/error.handler.js';
import securityMiddleware from './middlewares/security.middleware.js';
import sanitizeInput from './middlewares/sanitize.middleware.js';
import ensureDb from './middlewares/db.ensure.js';

import monitorRoutes from './routes/api/monitor.routes.js';
import router from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

securityMiddleware(app);
app.use(sanitizeInput());

app.get('', (req, res) =>
  res.status(200).json({ status: 'success', message: 'Backend is running...' })
);

app.use('/monitor', ensureDb, monitorRoutes);
app.use('/api', ensureDb, router);

app.use(errorHandler);

export default app;
