/**
 * POST /api/auth/refresh - Refresh access token using refresh token (cookie).
 * Always issues a pre-org access token. Client must call select-org again to get org-scoped token.
 */

import jwt from 'jsonwebtoken';
import { sendResponse } from '../../utils/response.js';
import { COOKIE_TOKEN } from '../../typings/index.js';
import { JWT_SECRET_REFRESH_KEY } from '../../config/env.js';
import { generateTokens } from './utils/index.js';

const refresh = async (req, res) => {
  const refresh_token = req.cookies?.[COOKIE_TOKEN.REFRESH_TOKEN];

  if (!refresh_token) {
    return sendResponse(res, 401, 'No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(refresh_token, JWT_SECRET_REFRESH_KEY);
  } catch {
    return sendResponse(res, 401, 'Invalid or expired refresh token');
  }

  try {
    const payload = {
      user_id: decoded.user_id,
      subscriber_id: decoded.subscriber_id,
      ...(decoded.email && { email: decoded.email }),
    };

    const { access_token } = generateTokens(payload);

    return sendResponse(res, 200, 'Access token refreshed successfully', {
      access_token,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default refresh;
