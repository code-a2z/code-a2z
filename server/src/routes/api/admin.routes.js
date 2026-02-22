import express from 'express';
import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';
import getPendingOrganizations from '../../controllers/admin/get-pending-organizations.js';
import approveOrganization from '../../controllers/admin/approve-organization.js';
import rejectOrganization from '../../controllers/admin/reject-organization.js';

const adminRoutes = express.Router();
const adminPanelAccess = requirePermission('admin_panel', 'access');

adminRoutes.get(
  '/organizations/pending',
  authenticateUser,
  requireOrgScope,
  adminPanelAccess,
  getPendingOrganizations
);

adminRoutes.post(
  '/organizations/:id/approve',
  authenticateUser,
  requireOrgScope,
  adminPanelAccess,
  approveOrganization
);

adminRoutes.post(
  '/organizations/:id/reject',
  authenticateUser,
  requireOrgScope,
  adminPanelAccess,
  rejectOrganization
);

export default adminRoutes;
