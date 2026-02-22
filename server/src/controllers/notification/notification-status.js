/**
 * GET /api/notification/status - Get new notification status for user
 * @returns {Object} New notification available status
 */

import NOTIFICATION from '../../models/notification.model.js';
import { sendResponse } from '../../utils/response.js';

const notificationStatus = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  const user_id = req.user.user_id;

  try {
    const result = await NOTIFICATION.exists({
      author_id: user_id,
      org_id,
      user_id: { $ne: user_id },
      seen: false,
    });

    return sendResponse(
      res,
      200,
      result ? 'New notification available' : 'No new notifications',
      { new_notification_available: Boolean(result) }
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default notificationStatus;
