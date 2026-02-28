import express from 'express';
import v1Router from './v1/index.js';

const apiRouter = express.Router();

apiRouter.use('/v1', v1Router);

export default apiRouter;
