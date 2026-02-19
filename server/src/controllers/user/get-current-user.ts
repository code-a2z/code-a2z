/**
 * GET /api/user/me - Get current authenticated user
 * @returns {Object} Current user profile
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';

const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id } = req.user!;

    if (!user_id) {
      return sendResponse(res, 401, 'User ID not found in token');
    }

    const user = await USER.findById(user_id)
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

export default getCurrentUser;
