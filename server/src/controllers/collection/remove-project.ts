/**
 * PATCH /api/collection/remove-project - Remove a project from a collection
 * @param {string} collection_id - Collection ID (body param)
 * @param {string} project_id - Project ID (body param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import COLLECTION from '../../models/collection.model.js';
import { Types } from 'mongoose';
import { sendResponse } from '../../utils/response.js';

const removeProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { collection_id, project_id } = req.body;

    if (!collection_id || !Types.ObjectId.isValid(collection_id)) {
      return sendResponse(res, 400, 'Invalid or missing collection_id');
    }
    if (!project_id || !Types.ObjectId.isValid(project_id)) {
      return sendResponse(res, 400, 'Invalid or missing project_id');
    }

    // Remove project from collection
    const updated_collection = await COLLECTION.findOneAndUpdate(
      { _id: collection_id, user_id, project_ids: { $in: [project_id] } },
      { $pull: { project_ids: project_id } },
      { new: true }
    );

    if (!updated_collection) {
      return sendResponse(res, 404, 'Project not found in this collection');
    }

    return sendResponse(
      res,
      200,
      'Project removed from collection successfully'
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default removeProject;
