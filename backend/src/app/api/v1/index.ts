import express from 'express';
import healthV1Routes from '../../../modules/health/infra/http/routes/v1.routes.js';

const v1Router = express.Router();

v1Router.use('/health', healthV1Routes);

export default v1Router;
