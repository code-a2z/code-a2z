/**
 * GET /api/comment/list?project_id= - Get comments for a project
 * @param {string} project_id - Project ID (query param)
 * @param {number} [skip=0] - Number of comments to skip (pagination)
 * @returns {Object[]} Array of comments
 */

import { Request, Response } from 'express';
import COMMENT from '../../models/comment.model.js';
import { sendResponse } from '../../utils/response.js';

const getComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { project_id, skip = 0 } = req.query;
    const maxLimit = 5;

    if (!project_id) {
      return sendResponse(res, 400, 'Project ID is required');
    }

    const comments = await COMMENT.find({ project_id, is_reply: false })
      .populate(
        'user_id',
        'personal_info.username personal_info.fullname personal_info.profile_img -_id'
      )
      .skip(parseInt(skip as string))
      .limit(maxLimit)
      .sort({ createdAt: -1 })
      .lean();

    // Replace user_id with personal_info
    comments.forEach((comment: any) => {
      if (comment.user_id) {
        comment.personal_info = comment.user_id.personal_info;
        delete comment.user_id;
      }
    });

    return sendResponse(res, 200, 'Comments fetched successfully', comments);
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default getComments;
