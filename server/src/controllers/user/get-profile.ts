/**
 * GET /api/user/profile?username= - Get user profile by username
 * @param {string} username - Username (query param)
 * @returns {Object} User profile
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';

const getProfile = async (req: Request, res: Response): Promise<Response> => {
  const username = req.query.username;
  if (!username) {
    return sendResponse(res, 400, 'Username is required');
  }

  try {
    let user = await USER.findOne({ 'personal_info.username': username })
      .select(
        '-personal_info.password -updatedAt -projects -collaborated_projects -collections'
      )
      .populate({
        path: 'personal_info.subscriber_id',
        select: 'email -_id',
      })
      .lean();

    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }

    // Extract email and remove subscriber_id
    if ((user.personal_info as any)?.subscriber_id?.email) {
      (user.personal_info as any).email = (
        user.personal_info as any
      ).subscriber_id.email;
      delete (user.personal_info as any).subscriber_id;
    }

    return sendResponse(res, 200, 'User fetched successfully', user);
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default getProfile;
