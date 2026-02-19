import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import getProfile from '../../controllers/user/get-profile';
import getCurrentUser from '../../controllers/user/get-current-user';
import searchUser from '../../controllers/user/search-user';
import updateProfile from '../../controllers/user/update-profile';
import updateProfileImg from '../../controllers/user/update-profile-img';

const userRoutes: Router = Router();

userRoutes.get('/search', searchUser);
userRoutes.get('/profile', getProfile);
userRoutes.get('/me', authenticateUser, getCurrentUser);
userRoutes.patch('/update-profile-img', authenticateUser, updateProfileImg);
userRoutes.patch('/update-profile', authenticateUser, updateProfile);

export default userRoutes;
