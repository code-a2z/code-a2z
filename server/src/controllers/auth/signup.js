/**
 * POST /api/auth/signup - Public signup is disabled (invite-only).
 * Returns 403. Users must be invited by an organization admin.
 */

import { sendResponse } from '../../utils/response.js';

const signup = async (_req, res) => {
  return sendResponse(
    res,
    403,
    'Signup is disabled. Ask an organization admin to invite you by email.'
  );
};

export default signup;
