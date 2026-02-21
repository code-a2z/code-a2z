/**
 * GET /api/auth/accept-invite?token= - Public. Returns org name for valid pending invite.
 * Does not leak invite details; only org name for UX.
 */

import ORGANIZATION_INVITE from '../../models/organization-invite.model.js';
import ORGANIZATION from '../../models/organization.model.js';
import { sendResponse } from '../../utils/response.js';

const getAcceptInvite = async (req, res) => {
  const token = req.query?.token;

  if (!token || typeof token !== 'string') {
    return sendResponse(res, 400, 'Token is required');
  }

  try {
    const invite = await ORGANIZATION_INVITE.findOne({
      token: token.trim(),
      status: 'pending',
      expires_at: { $gt: new Date() },
    })
      .select('org_id')
      .lean();

    if (!invite) {
      return sendResponse(res, 404, 'Invite not found or expired');
    }

    const org = await ORGANIZATION.findById(invite.org_id)
      .select('name')
      .lean();
    if (!org) {
      return sendResponse(res, 404, 'Organization not found');
    }

    return sendResponse(res, 200, 'Invite valid', {
      org_name: org.name,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getAcceptInvite;
