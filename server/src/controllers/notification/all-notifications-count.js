/**
 * GET /api/notification/count - Get total notifications count for user
 * @param {string} [filter] - Notification type filter (query param)
 * @returns {Object} Total count
 */

import NOTIFICATION from '../../models/notification.model.js';
import { NOTIFICATION_TYPES } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';

const allNotificationsCount = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  const user_id = req.user.user_id;
  const filter = req.query.filter || NOTIFICATION_TYPES.ALL;
  const findQuery = {
    author_id: user_id,
    org_id,
    user_id: { $ne: user_id },
  };
  if (filter !== NOTIFICATION_TYPES.ALL) {
    findQuery.type = filter;
  }

  try {
    const count = await NOTIFICATION.countDocuments(findQuery);
    return sendResponse(
      res,
      200,
      'Total notifications count fetched successfully',
      { totalDocs: count }
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      err.message || 'Failed to fetch total notifications count'
    );
  }
};

export default allNotificationsCount;
