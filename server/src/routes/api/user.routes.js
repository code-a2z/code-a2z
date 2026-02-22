import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import getProfile from '../../controllers/user/get-profile.js';
import getCurrentUser from '../../controllers/user/get-current-user.js';
import searchUser from '../../controllers/user/search-user.js';
import updateProfile from '../../controllers/user/update-profile.js';
import updateProfileImg from '../../controllers/user/update-profile-img.js';

const userRoutes = express.Router();

userRoutes.get('/search', searchUser);
userRoutes.get('/profile', getProfile);
userRoutes.get('/me', authenticateUser, requireOrgScope, getCurrentUser);
userRoutes.patch(
  '/update-profile-img',
  authenticateUser,
  requireOrgScope,
  updateProfileImg
);
userRoutes.patch(
  '/update-profile',
  authenticateUser,
  requireOrgScope,
  updateProfile
);

export default userRoutes;
