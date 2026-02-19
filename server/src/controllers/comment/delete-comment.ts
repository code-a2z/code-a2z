/**
 * DELETE /api/comment/:comment_id - Delete a comment
 * @param {string} comment_id - Comment ID (URL param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import PROJECT from '../../models/project.model.js';
import NOTIFICATION from '../../models/notification.model.js';
import COMMENT from '../../models/comment.model.js';
import { sendResponse } from '../../utils/response.js';

export const deleteComments = async (_id: any): Promise<boolean | null> => {
  const comment = await COMMENT.findOneAndDelete({ _id });
  if (!comment) return null;

  // Remove from parent comment if exists
  if (comment.parent_comment_id) {
    await COMMENT.findOneAndUpdate(
      { _id: comment.parent_comment_id },
      { $pull: { children_comment_ids: _id } }
    ).catch(() => {});
  }

  // Remove notifications
  await NOTIFICATION.findOneAndDelete({ comment_id: _id }).catch(() => {});
  await NOTIFICATION.findOneAndUpdate(
    { reply_id: _id },
    { $unset: { reply_id: 1 } }
  ).catch(() => {});

  // Update project
  await PROJECT.findOneAndUpdate(
    { _id: comment.project_id },
    {
      $pull: { comment_ids: _id },
      $inc: {
        'activity.total_comments': -1,
        'activity.total_parent_comments': comment.parent_comment_id ? 0 : -1,
      },
    }
  ).catch(() => {});

  // Recursively delete children
  if (comment.children_comment_ids.length) {
    for (const childId of comment.children_comment_ids) {
      await deleteComments(childId);
    }
  }

  return true;
};

const deleteComment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { comment_id } = req.params;
    if (!comment_id) return sendResponse(res, 400, 'Comment ID is required');

    const comment = await COMMENT.findOne({ _id: comment_id });
    if (!comment) return sendResponse(res, 404, 'Comment not found');

    const project = await PROJECT.findById(comment.project_id).select(
      'user_id'
    );

    if (
      user_id.toString() === comment.user_id?.toString() ||
      user_id.toString() === project?.user_id?.toString()
    ) {
      await deleteComments(comment_id);
      return sendResponse(res, 200, 'Comment deleted successfully');
    } else {
      return sendResponse(
        res,
        403,
        'You are not authorized to delete this comment'
      );
    }
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default deleteComment;
