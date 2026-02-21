/**
 * POST /api/auth/accept-invite - Public. Body: { token, password, fullname }.
 * Find invite; find or create Subscriber/User; create OrganizationMember; mark invite accepted.
 * Returns pre-org access_token and orgs for auto-login and redirect to select-org.
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import ORGANIZATION_INVITE from '../../models/organization-invite.model.js';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { generatePreOrgToken, generateUsername } from './utils/index.js';
import { USER_ROLES } from '../../typings/index.js';

const PASSWORD_MIN_LENGTH = 6;
const FULLNAME_MIN_LENGTH = 3;

const postAcceptInvite = async (req, res) => {
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
  if (!fullname || typeof fullname !== 'string') {
    return sendResponse(res, 400, 'Full name is required');
  }
  const trimmedFullname = fullname.trim();
  if (trimmedFullname.length < FULLNAME_MIN_LENGTH) {
    return sendResponse(res, 400, 'Full name must be at least 3 characters');
  }

  const useTransaction =
    process.env.MONGODB_URL && !process.env.MONGODB_URL.includes('_test');
  let session = null;
  if (useTransaction) {
    session = await mongoose.startSession();
    session.startTransaction();
  }
  const sessionOpts = session ? { session } : {};

  try {
    let query = ORGANIZATION_INVITE.findOne({
      token: token.trim(),
      status: 'pending',
      expires_at: { $gt: new Date() },
    });
    if (session) query = query.session(session);
    const invite = await query.lean();

    if (!invite) {
      if (session) {
        try {
          await session.abortTransaction();
        } catch {
          /* ignore */
        }
        try {
          await session.endSession();
        } catch {
          /* ignore */
        }
      }
      return sendResponse(res, 404, 'Invite not found or expired');
    }

    const email = invite.email;
    query = SUBSCRIBER.findOne({ email });
    if (session) query = query.session(session);
    let subscriber = await query.lean();
    let user;

    if (subscriber) {
      query = USER.findOne({
        'personal_info.subscriber_id': subscriber._id,
      });
      if (session) query = query.session(session);
      user = await query.lean();
      if (!user) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return sendResponse(res, 500, 'User record missing for this email');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await USER.updateOne(
        { _id: user._id },
        {
          $set: {
            'personal_info.password': hashedPassword,
            'personal_info.fullname': trimmedFullname,
          },
        },
        sessionOpts
      );
    } else {
      subscriber = await SUBSCRIBER.create(
        [{ email, is_subscribed: true }],
        sessionOpts
      ).then(r => r[0]);
      const username = await generateUsername(email);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await USER.create(
        [
          {
            personal_info: {
              fullname: trimmedFullname,
              subscriber_id: subscriber._id,
              password: hashedPassword,
              username,
            },
            role: USER_ROLES.USER,
          },
        ],
        sessionOpts
      ).then(r => r[0]);
      user = newUser;
    }

    query = ORGANIZATION_MEMBER.findOne({
      org_id: invite.org_id,
      user_id: user._id,
    });
    if (session) query = query.session(session);
    const existingMember = await query.lean();
    if (existingMember) {
      await ORGANIZATION_INVITE.updateOne(
        { _id: invite._id },
        { $set: { status: 'accepted' } },
        sessionOpts
      );
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      return sendResponse(
        res,
        409,
        'You are already a member of this organization'
      );
    }

    await ORGANIZATION_MEMBER.create(
      [
        {
          user_id: user._id,
          org_id: invite.org_id,
          role: invite.role,
        },
      ],
      sessionOpts
    );

    await ORGANIZATION_INVITE.updateOne(
      { _id: invite._id },
      { $set: { status: 'accepted' } },
      sessionOpts
    );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    const memberships = await ORGANIZATION_MEMBER.find({ user_id: user._id })
      .populate('org_id', 'name slug')
      .lean();
    const orgs = memberships
      .filter(m => m.org_id)
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
    const { access_token } = generatePreOrgToken(payload);

    const limitedUser = {
      id: user._id,
      fullname: trimmedFullname,
      username: user.personal_info?.username,
      email: subscriber.email,
      profile_img: user.personal_info?.profile_img,
    };

    return sendResponse(res, 200, 'Invite accepted', {
      user: limitedUser,
      orgs,
      access_token,
    });
  } catch (err) {
    if (session) {
      await session.abortTransaction().catch(() => {});
      session.endSession().catch(() => {});
    }
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default postAcceptInvite;
