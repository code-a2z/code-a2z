import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import invitationToCollaborate from '../../controllers/collaboration/invite-collab.js';
import acceptInvitation from '../../controllers/collaboration/accept-invite.js';
import rejectInvitation from '../../controllers/collaboration/reject-invite.js';
import getListOfCollaborators from '../../controllers/collaboration/list-collab.js';

const collaborationRoutes = express.Router();

collaborationRoutes.post(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  invitationToCollaborate
);
collaborationRoutes.post(
  '/accept/:token',
  authenticateUser,
  requireOrgScope,
  acceptInvitation
);
collaborationRoutes.post(
  '/reject/:token',
  authenticateUser,
  requireOrgScope,
  rejectInvitation
);
collaborationRoutes.get(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  getListOfCollaborators
);

export default collaborationRoutes;
