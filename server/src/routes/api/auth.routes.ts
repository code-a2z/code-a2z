import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import signup from '../../controllers/auth/signup';
import login from '../../controllers/auth/login';
import changePassword from '../../controllers/auth/change-password';
import refresh from '../../controllers/auth/refresh';
import logout from '../../controllers/auth/logout';

const authRoutes: Router = Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.patch('/change-password', authenticateUser, changePassword);

export default authRoutes;
