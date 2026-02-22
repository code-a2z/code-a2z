import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import likeProject from '../../controllers/like/like-project.js';
import likeStatus from '../../controllers/like/like-status.js';

const likeRoutes = express.Router();

likeRoutes.patch('/', authenticateUser, requireOrgScope, likeProject);
likeRoutes.get('/', authenticateUser, requireOrgScope, likeStatus);

export default likeRoutes;
