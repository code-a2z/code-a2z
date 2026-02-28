import express from 'express';
import type { Request, Response } from 'express';
import apiRouter from './api/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello, World!',
    status: 'ok',
  });
});

app.use('', apiRouter);

export default app;
