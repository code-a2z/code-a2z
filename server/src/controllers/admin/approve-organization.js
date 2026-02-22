/**
 * POST /api/admin/organizations/:id/approve - Set org status to 'active'.
 * If requester email has Subscriber+User: create OrganizationMember with that user_id, org_id, role OWNER.
 * If requester has no account: create a one-time set-password token, store it, and send email to
 * requested_by_email with link {CLIENT_URL}/set-password?token=...
 * Requires: authenticateUser, requireOrgScope, requirePermission('admin_panel', 'access').
 */

import crypto from 'crypto';
import mongoose from 'mongoose';
import ORGANIZATION from '../../models/organization.model.js';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import USER from '../../models/user.model.js';
import SET_PASSWORD_TOKEN from '../../models/set-password-token.model.js';
import resend from '../../config/resend.js';
import { sendResponse } from '../../utils/response.js';
import { ORG_MEMBER_ROLES } from '../../constants/rbac.js';
import { ADMIN_EMAIL, VITE_CLIENT_DOMAIN } from '../../config/env.js';

const TOKEN_EXPIRY_DAYS = 7;

const approveOrganization = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, 'Valid organization id is required');
  }

  try {
    const org = await ORGANIZATION.findOne({
      _id: id,
      status: 'pending',
    }).lean();

    if (!org) {
      return sendResponse(
        res,
        404,
        'Pending organization not found or already processed'
      );
    }

    const email = (org.requested_by_email || '').trim().toLowerCase();
    if (!email) {
      return sendResponse(
        res,
        400,
        'Organization request has no requested_by_email'
      );
    }

    const subscriber = await SUBSCRIBER.findOne({ email }).lean();
    let user = null;
    if (subscriber) {
      user = await USER.findOne({
        'personal_info.subscriber_id': subscriber._id,
      }).lean();
    }

    if (user) {
      await ORGANIZATION.updateOne({ _id: id }, { $set: { status: 'active' } });
      const existingMember = await ORGANIZATION_MEMBER.findOne({
        user_id: user._id,
        org_id: id,
      }).lean();
      if (!existingMember) {
        await ORGANIZATION_MEMBER.create({
          user_id: user._id,
          org_id: id,
          role: ORG_MEMBER_ROLES.OWNER,
        });
      }
      return sendResponse(
        res,
        200,
        'Organization approved; requester added as owner'
      );
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

    await SET_PASSWORD_TOKEN.create({
      token,
      email,
      org_id: id,
      expires_at: expiresAt,
    });

    const setPasswordLink = `${VITE_CLIENT_DOMAIN || 'http://localhost:5173'}/set-password?token=${token}`;

    try {
      await resend.emails.send({
        from: ADMIN_EMAIL,
        to: email,
        subject: `Your organization "${org.name}" has been approved`,
        html: `
          <p>Hi${org.requested_by_name ? ` ${org.requested_by_name}` : ''},</p>
          <p>Your organization request for <strong>${org.name}</strong> has been approved.</p>
          <p>Set your password to access your account and organization:</p>
          <p><a href="${setPasswordLink}">Set password</a></p>
          <p>This link expires in ${TOKEN_EXPIRY_DAYS} days.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p>Best regards,<br/>CodeA2Z Team</p>
        `,
      });
    } catch (emailErr) {
      console.error('Failed to send set-password email:', emailErr);
      await SET_PASSWORD_TOKEN.deleteOne({ token });
      return sendResponse(
        res,
        500,
        'Failed to send set-password email. Check server logs and email configuration (RESEND_API_KEY, ADMIN_EMAIL, VITE_CLIENT_DOMAIN).'
      );
    }

    await ORGANIZATION.updateOne({ _id: id }, { $set: { status: 'active' } });

    return sendResponse(
      res,
      200,
      'Organization approved; set-password email sent to requester'
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default approveOrganization;
