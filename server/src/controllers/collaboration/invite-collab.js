/**
 * POST /api/collab/:project_id - Invite a user to collaborate on a project
 * @param {string} project_id - Project ID (URL param)
 * @returns {Object} Success message and collaboration data
 */

import crypto from 'crypto';
import COLLABORATION from '../../models/collaboration.model.js';
import PROJECT from '../../models/project.model.js';
import USER from '../../models/user.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import resend from '../../config/resend.js';
import { sendResponse } from '../../utils/response.js';
import { ADMIN_EMAIL, VITE_SERVER_DOMAIN } from '../../config/env.js';
import { COLLABORATION_STATUS } from '../../typings/index.js';

const invitationToCollaborate = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  try {
    const user_id = req.user.user_id;
    const { project_id } = req.params;

    if (!project_id) {
      return sendResponse(res, 400, 'Project ID is required');
    }

    // Validate user
    const user = await USER.findById(user_id).select('personal_info.fullname');
    if (!user) return sendResponse(res, 404, 'User not found');

    // Validate project in current org and populate author email
    const project = await PROJECT.findOne({
      _id: project_id,
      org_id,
    }).populate({
      path: 'user_id',
      select: 'personal_info.subscriber_id',
    });
    if (!project) return sendResponse(res, 404, 'Project not found');

    const author = project.user_id;
    if (!author) return sendResponse(res, 404, 'Project author not found');

    if (String(user._id) === String(author._id)) {
      return sendResponse(
        res,
        400,
        'You cannot invite yourself to collaborate on your own project'
      );
    }

    const subscriber = await SUBSCRIBER.findOne({
      _id: author.personal_info.subscriber_id,
    }).select('email');
    const author_email = subscriber?.email;

    if (!author_email) {
      return sendResponse(
        res,
        400,
        'Project author does not have an email address'
      );
    }

    // Generate token and links
    const token = crypto.randomBytes(16).toString('hex');
    const acceptLink = `${VITE_SERVER_DOMAIN}/api/collab/accept/${token}`;
    const rejectLink = `${VITE_SERVER_DOMAIN}/api/collab/reject/${token}`;

    let emailSent = false;
    try {
      const response = await resend.emails.send({
        from: ADMIN_EMAIL,
        to: author_email,
        subject: `Collaboration Invitation on "${project.title}"`,
        html: `
          <p>Hi,</p>
          <p><strong>${user.personal_info?.fullname}</strong> has requested to collaborate on your project "${project.title}".</p>
          <p>Please click the links below to respond to the invitation:</p>
          <p>
            <a href="${acceptLink}">Accept Invitation</a> &nbsp;|&nbsp;
            <a href="${rejectLink}">Reject Invitation</a>
          </p>
          <p>If you did not expect this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br/>CodeA2Z Team</p>
        `,
      });
      console.log('Resend response:', response);

      // Depending on Resend API, you might want to check response status
      if (!response || !response.id) {
        throw new Error('Email not sent');
      }
      emailSent = true;
    } catch (emailError) {
      return sendResponse(
        res,
        500,
        emailError || 'Failed to send invitation email'
      );
    }

    if (emailSent) {
      const collaboration_data = await COLLABORATION.create({
        user_id: user._id,
        project_id,
        author_id: author._id,
        status: COLLABORATION_STATUS.PENDING,
        token,
      });

      return sendResponse(
        res,
        200,
        'Invitation sent successfully',
        collaboration_data
      );
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Failed to send invitation');
  }
};

export default invitationToCollaborate;
