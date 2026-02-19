/**
 * GET /api/user/search?query=page= - Search users by username
 * @param {string} query - Search query (query param)
 * @param {number} [page=1] - Page number (query param)
 * @returns {Object[]} Array of users
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';

const searchUser = async (req: Request, res: Response): Promise<Response> => {
  const query = req.query.query;
  let page = parseInt(req.query.page as string) || 1;
  const maxLimit = 10;

  if (page < 1) page = 1;
  if (!query || query === 'undefined') {
    return sendResponse(res, 400, 'Search query is required');
  }

  try {
    const users = await USER.find({
      'personal_info.username': new RegExp(query as string, 'i'),
    })
      .select(
        'personal_info.fullname personal_info.username personal_info.profile_img -_id'
      )
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .lean();

    return sendResponse(res, 200, 'Users fetched successfully', users);
  } catch (error) {
    return sendResponse(
      res,
      500,
      (error as Error).message || 'Internal Server Error'
    );
  }
};

export default searchUser;
