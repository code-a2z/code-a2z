import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import getAllSubscribers from '../../controllers/subscriber/get-all-subscribers';
import subscribeEmail from '../../controllers/subscriber/subscribe-email';
import unsubscribeEmail from '../../controllers/subscriber/unsubscribe-email';

const subscriberRoutes: Router = Router();

subscriberRoutes.post('/subscribe', subscribeEmail);
subscriberRoutes.patch('/unsubscribe', authenticateUser, unsubscribeEmail);
subscriberRoutes.get('/', authenticateUser, getAllSubscribers);

export default subscriberRoutes;
