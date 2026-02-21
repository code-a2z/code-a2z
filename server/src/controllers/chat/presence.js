/**
 * POST /api/chat/presence - Register/refresh current user's presence (e.g. when opening chat page)
 */

import { sendResponse } from '../../utils/response.js';
import { setPresence } from '../../stores/online-users.js';

const presence = async (req, res) => {
  try {
    const { user_id } = req.user;
    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }
    setPresence(String(user_id));
    return sendResponse(res, 200, 'Presence updated');
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default presence;
