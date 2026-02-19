/**
 * GET /api/collection/sort-project - Sort projects in a collection
 * @param {string} collection_id - Collection ID (query param)
 * @param {string} [sortBy=newest] - Sort criteria ('likes', 'newest', 'oldest')
 * @returns {Object[]} Array of sorted projects
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import COLLECTION from '../../models/collection.model.js';
import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const sortProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const collection_id = req.query.collection_id as string;
    const sort_by = (req.query.sort_by as string) || 'newest';

    if (!collection_id || !Types.ObjectId.isValid(collection_id)) {
      return sendResponse(res, 400, 'Invalid or missing collection_id');
    }

    // Fetch the collection for this user
    const collection = await COLLECTION.findOne({ user_id, _id: collection_id })
      .select('project_ids')
      .lean();

    if (!collection) {
      return sendResponse(res, 404, 'Collection not found');
    }

    const projectIds = collection.project_ids || [];
    if (!projectIds.length) {
      return sendResponse(res, 200, 'No projects found in this collection', []);
    }

    // Define sorting criteria
    const sortOptions: Record<string, any> = {
      likes: { 'activity.total_likes': -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const sortCriteria = sortOptions[sort_by] || sortOptions.newest;

    // Fetch projects with sorting and populate author
    const projects = await PROJECT.find({ _id: { $in: projectIds } })
      .sort(sortCriteria)
      .populate(
        'user_id',
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .lean();

    return sendResponse(res, 200, 'Projects fetched successfully', projects);
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default sortProject;
