import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendResponse } from '../../utils/response';

const monitorRoutes: Router = Router();

monitorRoutes.get('/health', (_req: Request, res: Response) => {
  sendResponse(res, 200, 'Service is healthy', {
    timestamp: new Date().toISOString(),
  });
});

monitorRoutes.get('/db-status', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  sendResponse(res, 200, dbState === 1 ? 'DB Connected' : 'DB Disconnected', {
    state: dbState,
  });
});

export default monitorRoutes;
