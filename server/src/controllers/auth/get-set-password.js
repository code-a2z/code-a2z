/**
 * GET /api/auth/set-password?token= - Public. Returns org name for valid set-password token.
 * Used so the set-password page can display "Set your password for [org name]".
 */

import SET_PASSWORD_TOKEN from '../../models/set-password-token.model.js';
import ORGANIZATION from '../../models/organization.model.js';
import { sendResponse } from '../../utils/response.js';

const getSetPassword = async (req, res) => {
  const token = req.query?.token;

  if (!token || typeof token !== 'string') {
    return sendResponse(res, 400, 'Token is required');
  }

  try {
    const record = await SET_PASSWORD_TOKEN.findOne({
      token: token.trim(),
      expires_at: { $gt: new Date() },
    })
      .select('org_id')
      .lean();

    if (!record) {
      return sendResponse(res, 404, 'Link not found or expired');
    }

    const org = await ORGANIZATION.findById(record.org_id)
      .select('name')
      .lean();
    if (!org) {
      return sendResponse(res, 404, 'Organization not found');
    }

    return sendResponse(res, 200, 'Token valid', {
      org_name: org.name,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default getSetPassword;
