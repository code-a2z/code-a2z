/**
 * POST /api/admin/organizations/:id/reject - Set organization status to 'rejected'.
 * Does not delete the document. Requires: authenticateUser, requireOrgScope, requirePermission('admin_panel', 'access').
 */

import mongoose from 'mongoose';
import ORGANIZATION from '../../models/organization.model.js';
import { sendResponse } from '../../utils/response.js';

const rejectOrganization = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, 'Valid organization id is required');
  }

  try {
    const org = await ORGANIZATION.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { $set: { status: 'rejected' } },
      { new: true }
    ).lean();

    if (!org) {
      return sendResponse(
        res,
        404,
        'Pending organization not found or already processed'
      );
    }

    return sendResponse(res, 200, 'Organization request rejected');
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default rejectOrganization;
