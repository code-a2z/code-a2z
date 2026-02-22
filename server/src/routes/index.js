import express from 'express';

// Import rate limiting middlewares
import authLimiter from '../middlewares/auth.limiter.js';
import generalLimiter from '../middlewares/general.limiter.js';

// Import route modules
import authRoutes from './api/auth.routes.js';
import subscriberRoutes from './api/subscriber.routes.js';
import mediaRoutes from './api/media.routes.js';
import userRoutes from './api/user.routes.js';
import projectRoutes from './api/project.routes.js';
import likeRoutes from './api/like.routes.js';
import commentRoutes from './api/comment.routes.js';
import notificationRoutes from './api/notification.routes.js';
import collectionRoutes from './api/collections.routes.js';
import collaborationRoutes from './api/collaboration.routes.js';
import feedbackRoutes from './api/feedback.routes.js';
import chatRoutes from './api/chat.routes.js';
import organizationRoutes from './api/organization.routes.js';
import adminRoutes from './api/admin.routes.js';

const router = express.Router();

router.use('/auth', authLimiter, authRoutes);
router.use('/organization', generalLimiter, organizationRoutes);
router.use('/admin', generalLimiter, adminRoutes);
router.use('/subscriber', generalLimiter, subscriberRoutes);
router.use('/media', generalLimiter, mediaRoutes);
router.use('/user', generalLimiter, userRoutes);
router.use('/project', generalLimiter, projectRoutes);
router.use('/like', generalLimiter, likeRoutes);
router.use('/comment', generalLimiter, commentRoutes);
router.use('/notification', generalLimiter, notificationRoutes);
router.use('/collection', generalLimiter, collectionRoutes);
router.use('/collaboration', generalLimiter, collaborationRoutes);
router.use('/feedback', generalLimiter, feedbackRoutes);
router.use('/chat', generalLimiter, chatRoutes);

export default router;
