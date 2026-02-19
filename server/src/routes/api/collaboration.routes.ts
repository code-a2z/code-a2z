import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import invitationToCollaborate from '../../controllers/collaboration/invite-collab';
import acceptInvitation from '../../controllers/collaboration/accept-invite';
import rejectInvitation from '../../controllers/collaboration/reject-invite';
import getListOfCollaborators from '../../controllers/collaboration/list-collab';

const collaborationRoutes: Router = Router();

collaborationRoutes.post(
  '/:project_id',
  authenticateUser,
  invitationToCollaborate
);
collaborationRoutes.post('/accept/:token', authenticateUser, acceptInvitation);
collaborationRoutes.post('/reject/:token', authenticateUser, rejectInvitation);
collaborationRoutes.get(
  '/:project_id',
  authenticateUser,
  getListOfCollaborators
);

export default collaborationRoutes;
