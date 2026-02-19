import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import getNotifications from '../../controllers/notification/get-notifications';
import notificationStatus from '../../controllers/notification/notification-status';
import allNotificationsCount from '../../controllers/notification/all-notifications-count';

const notificationRoutes: Router = Router();

notificationRoutes.get('/', authenticateUser, getNotifications);
notificationRoutes.get('/status', authenticateUser, notificationStatus);
notificationRoutes.get('/count', authenticateUser, allNotificationsCount);

export default notificationRoutes;
