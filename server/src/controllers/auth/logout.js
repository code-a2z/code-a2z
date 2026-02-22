/**
 * POST /api/auth/logout - Clear authentication and org context.
 * Server clears refresh-token cookie. Client must clear access token and
 * selectedOrgId (and any stored org_id) so that on next login the user
 * must call select-org again. For "switch org", call select-org with another org_id.
 *
 * @returns {Object} Success message and client_clear_hint
 */

import { sendResponse } from '../../utils/response.js';
import { COOKIE_TOKEN } from '../../typings/index.js';
import { REFRESH_COOKIE_OPTIONS } from './utils/index.js';

const logout = async (req, res) => {
  try {
    res.clearCookie(COOKIE_TOKEN.REFRESH_TOKEN, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });

    return sendResponse(res, 200, 'Logged out successfully', {
      client_clear_hint: {
        clear_access_token: true,
        clear_selected_org_id: true,
      },
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default logout;
