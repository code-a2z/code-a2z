import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';
import upload from '../../middlewares/multer.middleware';

import submitFeedback from '../../controllers/feedback/submit-feedback';
import getUserFeedback from '../../controllers/feedback/get-user-feedback';

const feedbackRoutes: Router = Router();

// Route checks authentication and handles single file upload logic for 'attachment' field
feedbackRoutes.post(
  '/submit',
  authenticateUser,
  upload.single('attachment'),
  submitFeedback
);

feedbackRoutes.get('/user', authenticateUser, getUserFeedback);

export default feedbackRoutes;
