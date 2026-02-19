/**
 * DELETE /api/project/:project_id - Delete a project
 * @param {string} project_id - Project ID (URL param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import USER from '../../models/user.model.js';
import NOTIFICATION from '../../models/notification.model.js';
import COMMENT from '../../models/comment.model.js';
import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const deleteProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { project_id } = req.params;

    if (!project_id) {
      return sendResponse(res, 400, 'Project ID is required');
    }

    // Clean up related data asynchronously (non-blocking)
    NOTIFICATION.deleteMany({ project_id }).catch(() => {});
    COMMENT.deleteMany({ project_id }).catch(() => {});

    // Update user stats
    await USER.findOneAndUpdate(
      { _id: user_id },
      {
        $pull: { project_ids: project_id },
        $inc: { 'account_info.total_posts': -1 },
      }
    );

    // Delete the project
    await PROJECT.findOneAndDelete({ _id: project_id, user_id: user_id });

    return sendResponse(res, 200, 'Project deleted successfully');
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal server error'
    );
  }
};

export default deleteProject;
