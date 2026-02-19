/**
 * PATCH /api/user/profile-img - Update user profile image
 * @param {string} url - Profile image URL (body param)
 * @returns {Object} Updated profile image
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import { URL_REGEX } from '../../utils/regex.js';
import { sendResponse } from '../../utils/response.js';

const updateProfileImg = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { url } = req.body;
  if (!url) {
    return sendResponse(res, 400, 'Profile image URL is required');
  }
  if (!URL_REGEX.test(url)) {
    return sendResponse(res, 400, 'Invalid URL format');
  }

  try {
    const updated_user = await USER.findOneAndUpdate(
      { _id: req.user!.user_id },
      { 'personal_info.profile_img': url },
      { new: true }
    ).select('personal_info.profile_img');

    if (!updated_user) {
      return sendResponse(res, 404, 'User not found');
    }

    return sendResponse(res, 200, 'Profile image updated successfully', {
      profile_img: updated_user.personal_info?.profile_img,
    });
  } catch (error) {
    return sendResponse(
      res,
      500,
      (error as Error).message || 'Internal Server Error'
    );
  }
};

export default updateProfileImg;
