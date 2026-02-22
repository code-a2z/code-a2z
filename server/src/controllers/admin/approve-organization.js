/**
 * POST /api/admin/organizations/:id/approve - Set org status to 'active'.
 * If requester email has Subscriber+User: create OrganizationMember with that user_id, org_id, role OWNER.
 * If requester has no account: create a one-time set-password token, store it, and send email to
 * requested_by_email with link {CLIENT_URL}/set-password?token=...
 * Requires: authenticateUser, requireOrgScope, requirePermission('admin_panel', 'access').
 */

import ORGANIZATION from '../../models/organization.model.js';
import SET_PASSWORD_TOKEN from '../../models/set-password-token.model.js';
import resend from '../../config/resend.js';
import { sendResponse } from '../../utils/response.js';
import { approveOrganizationCore } from '../../services/approve-organization.js';
import { ADMIN_EMAIL } from '../../config/env.js';

const TOKEN_EXPIRY_DAYS = 7;

const approveOrganization = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await approveOrganizationCore(id);

    if (!result.success) {
      const status = result.message.includes('not found') ? 404 : 400;
      return sendResponse(res, status, result.message);
    }

    if (result.alreadyHadUser) {
      return sendResponse(res, 200, result.message);
    }

    if (result.setPasswordLink) {
      const org = await ORGANIZATION.findById(id)
        .select('name requested_by_name requested_by_email')
        .lean();
      const email = (org?.requested_by_email || '').trim().toLowerCase();
      if (!email) {
        return sendResponse(res, 500, 'Missing requested_by_email');
      }

      const tokenFromLink = new URL(result.setPasswordLink).searchParams.get(
        'token'
      );

      try {
        await resend.emails.send({
          from: ADMIN_EMAIL,
          to: email,
          subject: `Your organization "${org?.name || 'Organization'}" has been approved`,
          html: `
          <p>Hi${org?.requested_by_name ? ` ${org.requested_by_name}` : ''},</p>
          <p>Your organization request for <strong>${org?.name || 'Organization'}</strong> has been approved.</p>
          <p>Set your password to access your account and organization:</p>
          <p><a href="${result.setPasswordLink}">Set password</a></p>
          <p>This link expires in ${TOKEN_EXPIRY_DAYS} days.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p>Best regards,<br/>CodeA2Z Team</p>
        `,
        });
      } catch (emailErr) {
        console.error('Failed to send set-password email:', emailErr);
        if (tokenFromLink) {
          await SET_PASSWORD_TOKEN.deleteOne({ token: tokenFromLink }).catch(
            () => {}
          );
        }
        return sendResponse(
          res,
          500,
          'Failed to send set-password email. Check server logs and email configuration (RESEND_API_KEY, ADMIN_EMAIL, VITE_CLIENT_DOMAIN).'
        );
      }

      return sendResponse(
        res,
        200,
        'Organization approved; set-password email sent to requester'
      );
    }

    return sendResponse(res, 200, result.message);
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default approveOrganization;
