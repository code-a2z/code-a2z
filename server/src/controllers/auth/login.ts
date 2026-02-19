/**
 * POST /api/auth/login - Authenticate user and return tokens
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} User object with authentication tokens
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import USER from '../../models/user.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { COOKIE_TOKEN, NODE_ENV } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';
import { generateTokens } from './utils/index.js';
import { JWT_REFRESH_EXPIRES_IN_NUM, SERVER_ENV } from '../../config/env.js';

const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, 'Email and password are required');
  }

  try {
    const subscriber = await SUBSCRIBER.findOne({ email });

    if (!subscriber) {
      return sendResponse(res, 404, 'Email not found');
    }

    const user = await USER.findOne({
      'personal_info.subscriber_id': subscriber._id,
    });

    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }

    if (!user.personal_info?.password) {
      return sendResponse(res, 500, 'User password is not set');
    }

    const is_password_match = await bcrypt.compare(
      password,
      user.personal_info.password
    );

    if (!is_password_match) {
      return sendResponse(res, 401, 'Incorrect password');
    }

    const payload = {
      user_id: user._id,
      subscriber_id: subscriber._id,
    };

    const { access_token, refresh_token } = generateTokens(payload);
    res.cookie(COOKIE_TOKEN.REFRESH_TOKEN, refresh_token, {
      httpOnly: true,
      secure: SERVER_ENV === NODE_ENV.PRODUCTION,
      sameSite: 'strict',
      path: '/',
      maxAge: JWT_REFRESH_EXPIRES_IN_NUM,
    });

    return sendResponse(res, 200, 'Login successful', { user, access_token });
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default login;
