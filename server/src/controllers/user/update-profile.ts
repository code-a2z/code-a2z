/**
 * PATCH /api/user/profile - Update user profile
 * @param {string} username - Username (body param)
 * @param {string} bio - Bio (body param)
 * @param {object} [social_links] - Social links (body param)
 * @returns {Object} Updated username
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { PROFILE_BIO_LIMIT } from '../../constants/index.js';
import { URL_REGEX } from '../../utils/regex.js';

const updateProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { username, bio, social_links } = req.body;
  if (!username || username.length < 3) {
    return sendResponse(
      res,
      403,
      'Username should be at least 3 characters long'
    );
  }

  if (bio && bio.length > PROFILE_BIO_LIMIT) {
    return sendResponse(
      res,
      403,
      `Bio should be less than ${PROFILE_BIO_LIMIT} characters`
    );
  }

  // TODO: Validate social links
  try {
    const socialLinksArr = Object.keys(social_links || {});
    for (let i = 0; i < socialLinksArr.length; i++) {
      const link = social_links[socialLinksArr[i]];
      if (link && link.length > 0) {
        const hostname = new URL(link).hostname;
        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] !== 'website' &&
          !URL_REGEX.test(link)
        ) {
          return sendResponse(
            res,
            403,
            `${socialLinksArr[i]} link is invalid. You must enter a full link with http(s)`
          );
        }
      }
    }
  } catch (err) {
    return sendResponse(
      res,
      500,
      `You must provide full social links with http(s) included - ${(err as Error).message}`
    );
  }

  const updateObj = {
    'personal_info.username': username,
    'personal_info.bio': bio || '',
    social_links: social_links || {},
  };

  try {
    const updated_user = await USER.findOneAndUpdate(
      { _id: req.user!.user_id },
      updateObj,
      { runValidators: true, new: true, context: 'query' }
    );

    if (!updated_user) {
      return sendResponse(res, 404, 'User not found');
    }

    return sendResponse(res, 200, 'Profile updated successfully', {
      username: updated_user.personal_info?.username,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      // Duplicate key error (username already taken)
      return sendResponse(res, 409, 'Username is already taken');
    }
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default updateProfile;
