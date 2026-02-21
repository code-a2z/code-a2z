/**
 * POST /api/collab/accept/:token - Accept a collaboration invitation
 * @param {string} token - Invitation token (URL param)
 * @returns {Object} Success message
 */

import COLLABORATION from '../../models/collaboration.model.js';
import PROJECT from '../../models/project.model.js';
import { COLLABORATION_STATUS } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';

const acceptInvitation = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  try {
    const user_id = req.user.user_id;
    const token = req.params.token;

    const collaboration = await COLLABORATION.findOne({
      token,
      author_id: user_id,
      status: COLLABORATION_STATUS.PENDING,
    });

    if (!collaboration) {
      return sendResponse(res, 404, 'Invalid or expired token!');
    }

    const projectInOrg = await PROJECT.exists({
      _id: collaboration.project_id,
      org_id,
    });
    if (!projectInOrg) {
      return sendResponse(res, 403, 'Project not in your organization');
    }

    collaboration.status = COLLABORATION_STATUS.ACCEPTED;
    collaboration.token = ' '; // invalidate token
    await collaboration.save();

    return sendResponse(
      res,
      200,
      'Collaboration invitation accepted successfully'
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default acceptInvitation;
