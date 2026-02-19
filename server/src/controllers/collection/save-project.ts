/**
 * POST /api/collection/save-project - Save a project to a collection
 * @param {string} collection_id - Collection ID (body param)
 * @param {string} project_id - Project ID (body param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import COLLECTION from '../../models/collection.model.js';
import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const saveProjectInCollection = async (
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

    // Check project existence
    const project_exists = await PROJECT.exists({ _id: project_id });
    if (!project_exists) {
      return sendResponse(res, 404, 'Project not found');
    }

    // Check collection existence for user
    const collection = await COLLECTION.findOne({
      user_id,
      _id: collection_id,
    });
    if (!collection) {
      return sendResponse(res, 404, 'Collection not found');
    }

    // Prevent duplicate project
    if (collection.project_ids.some(id => id.toString() === project_id)) {
      return sendResponse(
        res,
        200,
        'Project already exists in this collection'
      );
    }

    await COLLECTION.updateOne(
      { user_id, _id: collection_id },
      { $push: { project_ids: project_id } }
    );

    return sendResponse(res, 201, 'Project saved successfully!');
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default saveProjectInCollection;
