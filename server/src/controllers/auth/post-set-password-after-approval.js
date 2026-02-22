/**
 * POST /api/auth/set-password-after-approval - Public. Body: { token, password, fullname (optional) }.
 * Validates token; creates Subscriber (if not exists) and User (hashed password, fullname);
 * creates OrganizationMember (user_id, org_id, role OWNER); invalidates token.
 * Returns access_token, user, orgs for auto-login; sets refresh cookie.
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import SET_PASSWORD_TOKEN from '../../models/set-password-token.model.js';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { generatePreOrgToken, generateUsername } from './utils/index.js';
import { USER_ROLES } from '../../typings/index.js';
import { ORG_MEMBER_ROLES } from '../../constants/rbac.js';
import { COOKIE_TOKEN, NODE_ENV } from '../../typings/index.js';
import { JWT_REFRESH_EXPIRES_IN_NUM, SERVER_ENV } from '../../config/env.js';

const PASSWORD_MIN_LENGTH = 6;
const FULLNAME_MIN_LENGTH = 3;

function defaultFullname(email) {
  const part = (email || '').split('@')[0];
  if (part && part.length >= FULLNAME_MIN_LENGTH) return part;
  return `User${Date.now().toString(36).slice(-4)}`;
}

const postSetPasswordAfterApproval = async (req, res) => {
  const { token, password, fullname } = req.body;

  if (!token || typeof token !== 'string') {
    return sendResponse(res, 400, 'Token is required');
  }
  if (!password || typeof password !== 'string') {
    return sendResponse(res, 400, 'Password is required');
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return sendResponse(res, 400, 'Password must be at least 6 characters');
  }

  const trimmedFullname =
    fullname && typeof fullname === 'string' ? fullname.trim() : '';
  const finalFullname =
    trimmedFullname.length >= FULLNAME_MIN_LENGTH ? trimmedFullname : null;

  const useTransaction =
    process.env.MONGODB_URL && !process.env.MONGODB_URL.includes('_test');
  let session = null;
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }
  const sessionOpts = session ? { session } : {};

  try {
    let query = SET_PASSWORD_TOKEN.findOne({
      token: token.trim(),
      expires_at: { $gt: new Date() },
    });
    if (session) query = query.session(session);
    const record = await query.lean();

    if (!record) {
      if (session) {
        await session.abortTransaction().catch(() => {});
        await session.endSession().catch(() => {});
      }
      return sendResponse(res, 404, 'Link not found or expired');
    }

    const email = (record.email || '').toLowerCase();
    const orgId = record.org_id;
    const nameToUse = finalFullname || defaultFullname(email);

    let querySub = SUBSCRIBER.findOne({ email });
    if (session) querySub = querySub.session(session);
    let subscriber = await querySub.lean();
    let user;

    if (subscriber) {
      let queryUser = USER.findOne({
        'personal_info.subscriber_id': subscriber._id,
      });
      if (session) queryUser = queryUser.session(session);
      user = await queryUser.lean();
      if (!user) {
        if (session) {
          await session.abortTransaction().catch(() => {});
          await session.endSession().catch(() => {});
        }
        return sendResponse(res, 500, 'User record missing for this email');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await USER.updateOne(
        { _id: user._id },
        {
          $set: {
            'personal_info.password': hashedPassword,
            'personal_info.fullname': nameToUse,
          },
        },
        sessionOpts
      );
      user = await USER.findById(user._id).lean();
    } else {
      const created = await SUBSCRIBER.create(
        [{ email, is_subscribed: true }],
        sessionOpts
      );
      subscriber = Array.isArray(created) ? created[0] : created;
      const username = await generateUsername(email);
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await USER.create(
        [
          {
            personal_info: {
              fullname: nameToUse,
              subscriber_id: subscriber._id,
              password: hashedPassword,
              username,
            },
            role: USER_ROLES.USER,
          },
        ],
        sessionOpts
      );
      user = Array.isArray(createdUser) ? createdUser[0] : createdUser;
    }

    let queryMember = ORGANIZATION_MEMBER.findOne({
      org_id: orgId,
      user_id: user._id,
    });
    if (session) queryMember = queryMember.session(session);
    const existingMember = await queryMember.lean();
    if (!existingMember) {
      await ORGANIZATION_MEMBER.create(
        [
          {
            user_id: user._id,
            org_id: orgId,
            role: ORG_MEMBER_ROLES.OWNER,
          },
        ],
        sessionOpts
      );
    }

    await SET_PASSWORD_TOKEN.deleteOne({ token: token.trim() }, sessionOpts);

    if (session) {
      await session.commitTransaction();
      await session.endSession();
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

    return sendResponse(res, 200, 'Password set successfully', {
      user: limitedUser,
      orgs,
      access_token,
    });
  } catch (err) {
    if (session) {
      await session.abortTransaction().catch(() => {});
      await session.endSession().catch(() => {});
    }
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default postSetPasswordAfterApproval;
