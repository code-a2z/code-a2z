/**
 * GET /api/project/user/count - Get count of user's projects
 * @param {boolean} [draft] - Draft status
 * @param {string} [query] - Title search
 * @returns {Object} Total count
 */

import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const userProjectsCount = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  const user_id = req.user.user_id;
  const { is_draft, query = '' } = req.query;
  const titleFilter = new RegExp(query, 'i');

  try {
    const totalDocs = await PROJECT.countDocuments({
      user_id,
      org_id,
      is_draft: is_draft === 'true' || is_draft === true,
      title: titleFilter,
    });

    return sendResponse(res, 200, 'User projects count fetched successfully', {
      totalDocs,
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default userProjectsCount;
