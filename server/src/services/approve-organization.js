/**
 * Shared approve logic for a pending organization request.
 * Used by POST /api/admin/organizations/:id/approve and by the CLI approve-request script.
 * Does not send email; returns setPasswordLink when requester has no account so caller can send or log it.
 *
 * @param {string} orgId - MongoDB ObjectId of the pending organization
 * @returns {Promise<{ success: boolean, alreadyHadUser?: boolean, setPasswordLink?: string, message: string }>}
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import ORGANIZATION from '../models/organization.model.js';
import ORGANIZATION_MEMBER from '../models/organization-member.model.js';
import SUBSCRIBER from '../models/subscriber.model.js';
import USER from '../models/user.model.js';
import SET_PASSWORD_TOKEN from '../models/set-password-token.model.js';
import { ORG_MEMBER_ROLES } from '../constants/rbac.js';
import { VITE_CLIENT_DOMAIN } from '../config/env.js';

const TOKEN_EXPIRY_DAYS = 7;

export async function approveOrganizationCore(orgId) {
  if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
    return { success: false, message: 'Valid organization id is required' };
  }

  const org = await ORGANIZATION.findOne({
    _id: orgId,
    status: 'pending',
  }).lean();

  if (!org) {
    return {
      success: false,
      message: 'Pending organization not found or already processed',
    };
  }

  const email = (org.requested_by_email || '').trim().toLowerCase();
  if (!email) {
    return {
      success: false,
      message: 'Organization request has no requested_by_email',
    };
  }

  const subscriber = await SUBSCRIBER.findOne({ email }).lean();
  let user = null;
  if (subscriber) {
    user = await USER.findOne({
      'personal_info.subscriber_id': subscriber._id,
    }).lean();
  }

  if (user) {
    await ORGANIZATION.updateOne(
      { _id: orgId },
      { $set: { status: 'active' } }
    );
    const existingMember = await ORGANIZATION_MEMBER.findOne({
      user_id: user._id,
      org_id: orgId,
    }).lean();
    if (!existingMember) {
      await ORGANIZATION_MEMBER.create({
        user_id: user._id,
        org_id: orgId,
        role: ORG_MEMBER_ROLES.OWNER,
      });
    }
    return {
      success: true,
      alreadyHadUser: true,
      message: 'Organization approved; requester added as owner',
    };
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

  await SET_PASSWORD_TOKEN.create({
    token,
    email,
    org_id: orgId,
    expires_at: expiresAt,
  });

  const setPasswordLink = `${VITE_CLIENT_DOMAIN || 'http://localhost:5173'}/set-password?token=${token}`;
  await ORGANIZATION.updateOne({ _id: orgId }, { $set: { status: 'active' } });

  return {
    success: true,
    alreadyHadUser: false,
    setPasswordLink,
    message:
      'Organization approved; set-password link created (send by email or share locally)',
  };
}
