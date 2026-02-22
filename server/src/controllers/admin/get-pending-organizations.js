/**
 * GET /api/admin/organizations/pending - List organizations with status 'pending'.
 * Requires: authenticateUser, requireOrgScope, requirePermission('admin_panel', 'access').
 * Returns: _id, name, slug, requested_by_email, requested_by_name, createdAt.
 */

import ORGANIZATION from '../../models/organization.model.js';
import { sendResponse } from '../../utils/response.js';

const getPendingOrganizations = async (req, res) => {
  try {
    const list = await ORGANIZATION.find({ status: 'pending' })
      .select('_id name slug requested_by_email requested_by_name createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return sendResponse(res, 200, 'OK', {
      organizations: list.map(doc => ({
        _id: doc._id,
        name: doc.name,
        slug: doc.slug,
        requested_by_email: doc.requested_by_email,
        requested_by_name: doc.requested_by_name,
        createdAt: doc.createdAt,
      })),
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getPendingOrganizations;
