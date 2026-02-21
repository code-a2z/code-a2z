import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import createInvite from '../../controllers/organization/create-invite.js';

const organizationRoutes = express.Router();
const orgManageMembers = requirePermission('org', 'manage_members');

organizationRoutes.post(
  '/invite',
  authenticateUser,
  requireOrgScope,
  orgManageMembers,
  createInvite
);

export default organizationRoutes;
