/**
 * POST /api/auth/signup - Register a new user
 * @param {string} fullname - User's full name (min 3 characters)
 * @param {string} email - Valid email address
 * @param {string} password - Password (6-20 chars, uppercase, lowercase, number)
 * @returns {Object} User object with account details
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import USER from '../../models/user.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../../utils/regex.js';
import { SALT_ROUNDS } from '../../constants/index.js';
import { COOKIE_TOKEN, NODE_ENV } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';
import { generateTokens, generateUsername } from './utils/index.js';
import { JWT_REFRESH_EXPIRES_IN_NUM, SERVER_ENV } from '../../config/env.js';

const signup = async (req: Request, res: Response): Promise<Response> => {
  const { fullname, email, password } = req.body;

  if (!fullname || fullname.length < 3) {
    return sendResponse(
      res,
      400,
      'Full name must be at least 3 characters long'
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return sendResponse(res, 400, 'Invalid email address');
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return sendResponse(res, 400, 'Invalid password format');
  }

  try {
    const hashed_password = await bcrypt.hash(password, SALT_ROUNDS);
    const username = await generateUsername(email);

    let subscriber = await SUBSCRIBER.findOne({ email });

    if (subscriber) {
      const userExists = await USER.exists({
        'personal_info.subscriber_id': subscriber._id,
      });

      if (userExists) {
        return sendResponse(res, 400, 'Email is already registered');
      }

      if (!subscriber.is_subscribed) {
        subscriber.is_subscribed = true;
        subscriber.subscribed_at = new Date();
        subscriber.set('unsubscribed_at', undefined, { strict: false });
        await subscriber.save();
      }
    } else {
      subscriber = new SUBSCRIBER({
        email,
        is_subscribed: true,
        subscribed_at: new Date(),
      });
      await subscriber.save();
    }

    const user = new USER({
      personal_info: {
        fullname,
        subscriber_id: subscriber._id,
        password: hashed_password,
        username,
      },
    });

    const saved_user = await user.save();

    const payload = {
      user_id: saved_user._id,
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

    return sendResponse(res, 201, 'User registered successfully', {
      user: saved_user,
      access_token,
    });
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default signup;
