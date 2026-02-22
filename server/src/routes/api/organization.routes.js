import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import createInvite from '../../controllers/organization/create-invite.js';
import getMembers from '../../controllers/organization/get-members.js';
import requestOrganization from '../../controllers/organization/request-organization.js';

const organizationRoutes = express.Router();
const orgManageMembers = requirePermission('org', 'manage_members');

// Public: request a new organization (no auth)
organizationRoutes.post('/request', requestOrganization);

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
