/**
 * GET /api/project/user - Get projects for current user
 * @param {number} [page=1] - Page number
 * @param {boolean} [is_draft] - Draft status
 * @param {string} [query] - Title search
 * @param {number} [deletedDocCount=0] - Docs deleted in current session
 * @returns {Object[]} Array of projects
 */

import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const userProjects = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  try {
    const user_id = req.user.user_id;
    const { page = 1, is_draft, query = '', deletedDocCount = 0 } = req.query;

    const maxLimit = 5;
    const skipDocs = Math.max(0, (page - 1) * maxLimit - deletedDocCount);

    const projects = await PROJECT.find({
      user_id,
      org_id,
      is_draft: is_draft === 'true' || is_draft === true,
      title: new RegExp(query, 'i'),
    })
      .skip(skipDocs)
      .limit(maxLimit)
      .sort({ publishedAt: -1 })
      .select('title banner_url publishedAt activity description is_draft _id')
      .lean();

    return sendResponse(
      res,
      200,
      'User projects fetched successfully',
      projects
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default userProjects;
