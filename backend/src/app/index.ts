import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello, World!',
    status: 'ok',
  });
});

export default app;
