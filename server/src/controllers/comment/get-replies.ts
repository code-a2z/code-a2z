/**
 * GET /api/comment/replies?comment_id= - Get replies for a comment
 * @param {string} comment_id - Comment ID (query param)
 * @param {number} [skip=0] - Number of replies to skip (pagination)
 * @returns {Object[]} Array of replies
 */

import { Request, Response } from 'express';
import COMMENT from '../../models/comment.model.js';
import { sendResponse } from '../../utils/response.js';

const getReplies = async (req: Request, res: Response): Promise<Response> => {
  const { comment_id, skip = 0 } = req.query;
  const maxLimit = 5;

  if (!comment_id) {
    return sendResponse(res, 400, 'Comment ID is required');
  }

  try {
    const commentDoc = await COMMENT.findOne({ _id: comment_id })
      .populate({
        path: 'children_comment_ids',
        options: {
          limit: parseInt(maxLimit as any),
          skip: parseInt(skip as string),
          sort: { createdAt: -1 },
        },
        populate: {
          path: 'user_id',
          select:
            'personal_info.username personal_info.fullname personal_info.profile_img -_id',
        },
        select: '-project_id -updatedAt',
      })
      .select('children_comment_ids')
      .lean();

    // Replace user_id with personal_info in each reply
    commentDoc?.children_comment_ids.forEach((reply: any) => {
      if (reply.user_id) {
        reply.personal_info = reply.user_id.personal_info;
        delete reply.user_id;
      }
    });

    return sendResponse(
      res,
      200,
      'Replies fetched successfully',
      commentDoc?.children_comment_ids || []
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default getReplies;
