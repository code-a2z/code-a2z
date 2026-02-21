/**
 * POST /api/organization/invite - Create org invite (auth, requireOrgScope, org:manage_members).
 * Body: { email, role }. Creates invite with nanoid token, expires 7 days.
 * Scoped to current org only (req.user.org_id); no cross-org access.
 */

import { nanoid } from 'nanoid';
import ORGANIZATION_INVITE from '../../models/organization-invite.model.js';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';
import { ORG_MEMBER_ROLE_LIST } from '../../constants/rbac.js';

const INVITE_EXPIRY_DAYS = 7;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createInvite = async (req, res) => {
  const { email, role } = req.body;
  const orgId = req.user?.org_id;
  const userId = req.user?.user_id;

  if (!orgId || !userId) {
    return sendResponse(res, 403, 'Organization context required');
  }

  if (!email || typeof email !== 'string') {
    return sendResponse(res, 400, 'Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return sendResponse(res, 400, 'Invalid email format');
  }

  if (!role || !ORG_MEMBER_ROLE_LIST.includes(role)) {
    return sendResponse(
      res,
      400,
      `role must be one of: ${ORG_MEMBER_ROLE_LIST.join(', ')}`
    );
  }

  try {
    const existingPending = await ORGANIZATION_INVITE.findOne({
      org_id: orgId,
      email: normalizedEmail,
      status: 'pending',
      expires_at: { $gt: new Date() },
    });
    if (existingPending) {
      return sendResponse(
        res,
        409,
        'A pending invite already exists for this email in this organization'
      );
    }

    const subscriber = await SUBSCRIBER.findOne({ email: normalizedEmail })
      .select('_id')
      .lean();
    if (subscriber) {
      const existingUser = await USER.findOne({
        'personal_info.subscriber_id': subscriber._id,
      })
        .select('_id')
        .lean();
      if (existingUser) {
        const existingMember = await ORGANIZATION_MEMBER.findOne({
          org_id: orgId,
          user_id: existingUser._id,
        });
        if (existingMember) {
          return sendResponse(
            res,
            409,
            'This user is already a member of this organization'
          );
        }
      }
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await ORGANIZATION_INVITE.create({
      email: normalizedEmail,
      org_id: orgId,
      role,
      token,
      expires_at: expiresAt,
      created_by: userId,
      status: 'pending',
    });

    return sendResponse(res, 201, 'Invite created', {
      invite_id: invite._id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default createInvite;
