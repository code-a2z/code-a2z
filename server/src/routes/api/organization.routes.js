import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import createInvite from '../../controllers/organization/create-invite.js';
import getMembers from '../../controllers/organization/get-members.js';

const organizationRoutes = express.Router();
const orgManageMembers = requirePermission('org', 'manage_members');

organizationRoutes.get(
  '/members',
  authenticateUser,
  requireOrgScope,
  getMembers
);

organizationRoutes.post(
  '/invite',
  authenticateUser,
  requireOrgScope,
  orgManageMembers,
  createInvite
);

export default organizationRoutes;
