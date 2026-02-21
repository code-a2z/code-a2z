import express from 'express';

import authenticateUser, {
  authenticatePreOrgUser,
} from '../../middlewares/auth.middleware.js';

import signup from '../../controllers/auth/signup.js';
import login from '../../controllers/auth/login.js';
import selectOrg from '../../controllers/auth/select-org.js';
import changePassword from '../../controllers/auth/change-password.js';
import refresh from '../../controllers/auth/refresh.js';
import logout from '../../controllers/auth/logout.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post(
  '/select-org',
  authenticateUser,
  authenticatePreOrgUser,
  selectOrg
);
authRoutes.post('/logout', logout);
authRoutes.patch('/change-password', authenticateUser, changePassword);

export default authRoutes;
