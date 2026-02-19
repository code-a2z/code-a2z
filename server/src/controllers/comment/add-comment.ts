/**
 * POST /api/comment/add - Add a comment or reply to a project
 * @param {string} project_id - Project ID (body param)
 * @param {string} comment - Comment text (body param)
 * @param {string} [replying_to] - Parent comment ID (for replies)
 * @param {string} [notification_id] - Notification ID (for replies)
 * @returns {Object} Created comment
 */

import { Request, Response } from 'express';
import PROJECT from '../../models/project.model.js';
import NOTIFICATION from '../../models/notification.model.js';
import COMMENT from '../../models/comment.model.js';
import { sendResponse } from '../../utils/response.js';
import { NOTIFICATION_TYPES } from '../../typings/index.js';

const addComment = async (req: Request, res: Response): Promise<Response> => {
  const user_id = req.user!.user_id;
  const { project_id, comment, replying_to, notification_id } = req.body;

  if (!comment?.trim()?.length) {
    return sendResponse(res, 403, 'Write something to leave a comment');
  }

  try {
    const project = await PROJECT.findById(project_id).select('user_id');
    if (!project) {
      return sendResponse(res, 404, 'Project not found');
    }

    const project_author = project.user_id;

    // Create comment object
    const commentObj = {
      project_id,
      comment,
      user_id: user_id,
      is_reply: Boolean(replying_to),
      parent_comment_id: replying_to || null,
    };

    // Save the comment
    const commentDoc = await new COMMENT(commentObj).save();

    // Update project activity and comments array
    await PROJECT.findOneAndUpdate(
      { _id: project_id },
      {
        $push: { comment_ids: commentDoc._id },
        $inc: {
          'activity.total_comments': 1,
          'activity.total_parent_comments': replying_to ? 0 : 1,
        },
      }
    );

    // Handle replies and get parent comment info
    let parentComment = null;
    if (replying_to) {
      parentComment = await COMMENT.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children_comment_ids: commentDoc._id } },
        { new: true }
      );

      if (notification_id) {
        await NOTIFICATION.findOneAndUpdate(
          { _id: notification_id },
          { reply_id: commentDoc._id }
        );
      }
    }

    // Prepare notification
    const notificationObj = new NOTIFICATION({
      type: replying_to ? NOTIFICATION_TYPES.REPLY : NOTIFICATION_TYPES.COMMENT,
      project_id,
      user_id: user_id,
      author_id: replying_to ? parentComment?.user_id : project_author,
      comment_id: commentDoc._id,
      replied_on_comment_id: replying_to || undefined,
    });

    await notificationObj.save();

    return sendResponse(res, 200, 'Comment added successfully', {
      _id: commentDoc._id,
      comment: commentDoc.comment,
      createdAt: commentDoc.createdAt,
      user_id,
      children_comment_ids: commentDoc.children_comment_ids,
    });
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default addComment;
