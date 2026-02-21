import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import upload from '../../middlewares/multer.middleware.js';

import submitFeedback from '../../controllers/feedback/submit-feedback.js';
import getUserFeedback from '../../controllers/feedback/get-user-feedback.js';

const feedbackRoutes = express.Router();

const feedbackRead = requirePermission('feedback', 'read');
const feedbackWrite = requirePermission('feedback', 'write');

// Route checks authentication and handles single file upload logic for 'attachment' field
feedbackRoutes.post(
  '/submit',
  authenticateUser,
  requireOrgScope,
  feedbackWrite,
  upload.single('attachment'),
  submitFeedback
);

feedbackRoutes.get(
  '/user',
  authenticateUser,
  requireOrgScope,
  feedbackRead,
  getUserFeedback
);

export default feedbackRoutes;
