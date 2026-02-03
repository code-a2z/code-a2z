import express from 'express';

import authenticateUser from '../../middlewares/auth.middleware.js';

import signup from '../../controllers/auth/signup.js';
import login from '../../controllers/auth/login.js';
import changePassword from '../../controllers/auth/change-password.js';
import refresh from '../../controllers/auth/refresh.js';
import logout from '../../controllers/auth/logout.js';
import forgotPassword from '../../controllers/auth/forgot-password.js';

const authRoutes = express.Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.patch('/change-password', authenticateUser, changePassword);
authRoutes.post('/forgot-password', forgotPassword);

export default authRoutes;
