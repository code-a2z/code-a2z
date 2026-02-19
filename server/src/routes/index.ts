import { Router } from 'express';

// Import rate limiting middlewares
import authLimiter from '../middlewares/auth.limiter';
import generalLimiter from '../middlewares/general.limiter';

// Import route modules
import authRoutes from './api/auth.routes';
import subscriberRoutes from './api/subscriber.routes';
import mediaRoutes from './api/media.routes';
import userRoutes from './api/user.routes';
import projectRoutes from './api/project.routes';
import likeRoutes from './api/like.routes';
import commentRoutes from './api/comment.routes';
import notificationRoutes from './api/notification.routes';
import collectionRoutes from './api/collections.routes';
import collaborationRoutes from './api/collaboration.routes';
import feedbackRoutes from './api/feedback.routes';

const router: Router = Router();

router.use('/auth', authLimiter, authRoutes);
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

export default router;
