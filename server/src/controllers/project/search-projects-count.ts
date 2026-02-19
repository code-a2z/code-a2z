/**
 * GET /api/project/search-count - Get count of projects matching search
 * @param {string} [tag] - Tag to filter
 * @param {string} [user_id] - Author ID
 * @param {string} [query] - Title search
 * @returns {Object} Total count
 */

import { Request, Response } from 'express';
import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const searchProjectsCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tag, user_id, query } = req.query;

  let findQuery: any = { is_draft: false };
  if (tag) {
    findQuery.tags = tag;
  } else if (query) {
    findQuery.title = new RegExp(query as string, 'i');
  } else if (user_id) {
    findQuery.user_id = user_id;
  }

  try {
    const count = await PROJECT.countDocuments(findQuery);
    return sendResponse(
      res,
      200,
      'Search projects count fetched successfully',
      { totalDocs: count }
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal server error'
    );
  }
};

export default searchProjectsCount;
