/**
 * POST /api/collab/accept/:token - Accept a collaboration invitation
 * @param {string} token - Invitation token (URL param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import COLLABORATION from '../../models/collaboration.model.js';
import { COLLABORATION_STATUS } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';

const acceptInvitation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user;
    const token = req.params.token;

    // Find pending collaboration request for this user
    const collaboration = await COLLABORATION.findOne({
      token,
      author_id: user_id,
      status: COLLABORATION_STATUS.PENDING,
    });

    if (!collaboration) {
      return sendResponse(res, 404, 'Invalid or expired token!');
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
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default acceptInvitation;
