import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';

import getNotifications from '../../controllers/notification/get-notifications.js';
import notificationStatus from '../../controllers/notification/notification-status.js';
import allNotificationsCount from '../../controllers/notification/all-notifications-count.js';

const notificationRoutes = express.Router();

const notificationsRead = requirePermission('notifications', 'read');

notificationRoutes.get(
  '/',
  authenticateUser,
  requireOrgScope,
  notificationsRead,
  getNotifications
);
notificationRoutes.get(
  '/status',
  authenticateUser,
  requireOrgScope,
  notificationsRead,
  notificationStatus
);
notificationRoutes.get(
  '/count',
  authenticateUser,
  requireOrgScope,
  notificationsRead,
  allNotificationsCount
);

export default notificationRoutes;
