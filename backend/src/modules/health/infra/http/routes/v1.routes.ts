import express from 'express';
import { liveController } from '../../../controllers/live.controller.js';

const healthV1Routes = express.Router();

healthV1Routes.get('/live', liveController);

export default healthV1Routes;
