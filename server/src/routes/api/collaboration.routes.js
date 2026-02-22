import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';

import invitationToCollaborate from '../../controllers/collaboration/invite-collab.js';
import acceptInvitation from '../../controllers/collaboration/accept-invite.js';
import rejectInvitation from '../../controllers/collaboration/reject-invite.js';
import getListOfCollaborators from '../../controllers/collaboration/list-collab.js';

const collaborationRoutes = express.Router();

const collaborationRead = requirePermission('collaboration', 'read');
const collaborationWrite = requirePermission('collaboration', 'write');

collaborationRoutes.post(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  collaborationWrite,
  invitationToCollaborate
);
collaborationRoutes.post(
  '/accept/:token',
  authenticateUser,
  requireOrgScope,
  collaborationWrite,
  acceptInvitation
);
collaborationRoutes.post(
  '/reject/:token',
  authenticateUser,
  requireOrgScope,
  collaborationWrite,
  rejectInvitation
);
collaborationRoutes.get(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  collaborationRead,
  getListOfCollaborators
);

export default collaborationRoutes;
