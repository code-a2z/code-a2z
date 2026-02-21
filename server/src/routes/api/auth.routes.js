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
import getAcceptInvite from '../../controllers/auth/get-accept-invite.js';
import postAcceptInvite from '../../controllers/auth/post-accept-invite.js';

const authRoutes = express.Router();

authRoutes.get('/accept-invite', getAcceptInvite);
authRoutes.post('/accept-invite', postAcceptInvite);
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
