import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import likeProject from '../../controllers/like/like-project';
import likeStatus from '../../controllers/like/like-status';

const likeRoutes: Router = Router();

likeRoutes.patch('/', authenticateUser, likeProject);
likeRoutes.get('/', authenticateUser, likeStatus);

export default likeRoutes;
