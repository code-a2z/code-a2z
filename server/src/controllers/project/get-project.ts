/**
 * GET /api/project/:project_id - Get a project by ID
 * @param {string} project_id - Project ID (URL param)
 * @param {string} [mode] - Mode ('edit' or 'read')
 * @returns {Object} Project data
 */

import { Request, Response } from 'express';
import PROJECT from '../../models/project.model.js';
import USER from '../../models/user.model.js';
import { PROJECT_PERMISSION_MODES } from '../../typings/index.js';
import { sendResponse } from '../../utils/response.js';

const getProject = async (req: Request, res: Response): Promise<Response> => {
  const { project_id } = req.params;
  const { mode } = req.query; // mode can be 'edit' or 'read' & removed 'is_draft = false' boolean param
  const increment_val = mode !== PROJECT_PERMISSION_MODES.EDIT ? 1 : 0;
  if (!project_id) {
    return sendResponse(res, 400, 'Project ID is required');
  }

  try {
    const project = await PROJECT.findOneAndUpdate(
      { _id: project_id },
      { $inc: { 'activity.total_reads': increment_val } },
      { new: true }
    )
      .populate(
        'user_id',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .select(
        'title banner_url description content_blocks activity publishedAt tags live_url repository_url is_draft'
      )
      .lean();

    if (!project) {
      return sendResponse(res, 404, 'Project not found');
    }
    if (project.is_draft && mode !== PROJECT_PERMISSION_MODES.EDIT) {
      return sendResponse(res, 403, "You can't access draft project");
    }

    // Increment author's total_reads asynchronously
    if (
      (project as any).user_id &&
      (project as any).user_id.personal_info?.username
    ) {
      USER.findOneAndUpdate(
        {
          'personal_info.username': (project as any).user_id.personal_info
            .username,
        },
        { $inc: { 'account_info.total_reads': increment_val } }
      ).catch(() => {});
    }

    return sendResponse(res, 200, 'Project fetched successfully', project);
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal server error'
    );
  }
};

export default getProject;
