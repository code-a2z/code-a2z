/**
 * POST /api/auth/login - Authenticate user and return pre-org token + org list.
 * Returns pre-org access token (for select-org or refresh only), limited user, and orgs.
 * No org-scoped token here; client must call select-org to get org-scoped access.
 */

import bcrypt from 'bcrypt';
import USER from '../../models/user.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import { COOKIE_TOKEN, NODE_ENV } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';
import { generatePreOrgToken } from './utils/index.js';
import { JWT_REFRESH_EXPIRES_IN_NUM, SERVER_ENV } from '../../config/env.js';

const login = async (req, res) => {
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

    const memberships = await ORGANIZATION_MEMBER.find({ user_id: user._id })
      .populate('org_id', 'name slug status')
      .lean();

    const orgs = memberships
      .filter(
        m =>
          m.org_id && (m.org_id.status === 'active' || m.org_id.status == null)
      )
      .map(m => ({
        org_id: m.org_id._id,
        name: m.org_id.name,
        role: m.role,
      }));

    if (orgs.length === 0) {
      return sendResponse(
        res,
        403,
        'You are not a member of any organization. Ask an admin to invite you by email.'
      );
    }

    const payload = {
      user_id: user._id,
      subscriber_id: subscriber._id,
      email: subscriber.email,
    };

    const { access_token, refresh_token } = generatePreOrgToken(payload);
    res.cookie(COOKIE_TOKEN.REFRESH_TOKEN, refresh_token, {
      httpOnly: true,
      secure: SERVER_ENV === NODE_ENV.PRODUCTION,
      sameSite: 'strict',
      path: '/',
      maxAge: JWT_REFRESH_EXPIRES_IN_NUM,
    });

    const limitedUser = {
      id: user._id,
      fullname: user.personal_info?.fullname,
      username: user.personal_info?.username,
      email: subscriber.email,
      profile_img: user.personal_info?.profile_img,
    };

    return sendResponse(res, 200, 'Login successful', {
      user: limitedUser,
      orgs,
      access_token,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default login;
