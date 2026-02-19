/**
 * GET /api/notification/status - Get new notification status for user
 * @returns {Object} New notification available status
 */

import { Request, Response } from 'express';
import NOTIFICATION from '../../models/notification.model.js';
import { sendResponse } from '../../utils/response.js';

const notificationStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const user_id = req.user!.user_id;

  try {
    const result = await NOTIFICATION.exists({
      author_id: user_id,
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
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default notificationStatus;
