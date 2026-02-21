import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import getNotifications from '../../controllers/notification/get-notifications.js';
import notificationStatus from '../../controllers/notification/notification-status.js';
import allNotificationsCount from '../../controllers/notification/all-notifications-count.js';

const notificationRoutes = express.Router();

notificationRoutes.get(
  '/',
  authenticateUser,
  requireOrgScope,
  getNotifications
);
notificationRoutes.get(
  '/status',
  authenticateUser,
  requireOrgScope,
  notificationStatus
);
notificationRoutes.get(
  '/count',
  authenticateUser,
  requireOrgScope,
  allNotificationsCount
);

export default notificationRoutes;
