/**
 * GET /api/notification?page=&filter=&deletedDocCount= - Get notifications for user
 * @param {number} [page=1] - Page number (query param)
 * @param {string} [filter] - Notification type filter (query param)
 * @param {number} [deletedDocCount=0] - Number of deleted docs in session (query param)
 * @returns {Object[]} Array of notifications
 */

import { Request, Response } from 'express';
import NOTIFICATION from '../../models/notification.model.js';
import { NOTIFICATION_TYPES } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';

const getNotifications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const user_id = req.user!.user_id;
  const page = parseInt(req.query.page as string) || 1;
  const filter = req.query.filter || NOTIFICATION_TYPES.ALL;
  const deletedDocCount = parseInt(req.query.deletedDocCount as string) || 0;
  const maxLimit = 10;

  const findQuery: any = { author_id: user_id, user_id: { $ne: user_id } };
  if (filter !== NOTIFICATION_TYPES.ALL) {
    findQuery.type = filter;
  }

  let skipDocs = (page - 1) * maxLimit;
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }

  try {
    const notifications = await NOTIFICATION.find(findQuery)
      .skip(skipDocs)
      .limit(maxLimit)
      .populate('project_id', 'title _id')
      .populate(
        'user_id',
        'personal_info.username personal_info.fullname personal_info.profile_img'
      )
      .populate('comment_id', 'comment')
      .populate('replied_on_comment_id', 'comment')
      .populate('reply_id', 'comment')
      .sort({ createdAt: -1 })
      .select('createdAt type seen reply_id')
      .lean();

    // Mark these notifications as seen
    NOTIFICATION.updateMany(
      { _id: { $in: notifications.map((n: any) => n._id) } },
      { seen: true }
    ).catch(() => {});

    // Replace user_id with personal_info object
    notifications.forEach((notification: any) => {
      if (notification.user_id) {
        notification.personal_info = notification.user_id.personal_info;
        delete notification.user_id;
      }
    });

    return sendResponse(
      res,
      200,
      'Notifications fetched successfully',
      notifications
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default getNotifications;
