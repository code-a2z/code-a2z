/**
 * PATCH /api/auth/change-password - Change user password
 * @param {string} current_password - Current password
 * @param {string} new_password - New password
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import USER from '../../models/user.model.js';
import { SALT_ROUNDS } from '../../constants/index.js';
import { PASSWORD_REGEX } from '../../utils/regex.js';
import { sendResponse } from '../../utils/response.js';

const changePassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return sendResponse(
        res,
        400,
        'Both current and new passwords are required'
      );
    }

    if (
      !PASSWORD_REGEX.test(current_password) ||
      !PASSWORD_REGEX.test(new_password)
    ) {
      return sendResponse(
        res,
        400,
        'Password must be 6-20 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      );
    }

    const user = await USER.findById(user_id).select('personal_info.password');

    if (!user || !user.personal_info?.password) {
      return sendResponse(res, 404, 'User not found or password not set');
    }

    const is_password_match = await bcrypt.compare(
      current_password,
      user.personal_info.password
    );

    if (!is_password_match) {
      return sendResponse(res, 403, 'Incorrect current password');
    }

    const hashed_password = await bcrypt.hash(new_password, SALT_ROUNDS);

    await USER.findByIdAndUpdate(user_id, {
      'personal_info.password': hashed_password,
    });

    return sendResponse(res, 200, 'Password changed successfully');
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'An error occurred while changing the password'
    );
  }
};

export default changePassword;
