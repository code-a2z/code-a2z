/**
 * GET /api/collab/list/:project_id - List collaborators for a project
 * @param {string} project_id - Project ID (URL param)
 * @returns {Object[]} Array of collaborators
 */

import { Request, Response } from 'express';
import COLLABORATION from '../../models/collaboration.model.js';
import { sendResponse } from '../../utils/response.js';

const getListOfCollaborators = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user;
    const { project_id } = req.params;

    if (!project_id) {
      return sendResponse(res, 400, 'Project ID is required');
    }

    const collaborators = await COLLABORATION.find({
      project_id,
      author_id: user_id,
    })
      .populate(
        'user_id',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .select('-token')
      .lean();

    return sendResponse(
      res,
      200,
      'Collaborators fetched successfully',
      collaborators
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default getListOfCollaborators;
