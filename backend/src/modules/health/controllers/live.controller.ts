import type { Request, Response } from 'express';

export const liveController = (req: Request, res: Response) => {
  return res.status(200).json({
    message: 'Server is live',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};
