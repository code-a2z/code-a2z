/**
 * GET /api/project?page=1 - Get all published projects (paginated)
 * @param {number} [page=1] - Page number (query param)
 * @returns {Object[]} Array of projects
 */

import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const getAllProjects = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  let page = req.query.page || 1;
  const maxLimit = 10;

  if (page < 1) page = 1;

  try {
    const projects = await PROJECT.find({ is_draft: false, org_id })
      .populate({
        path: 'user_id',
        select:
          'personal_info.profile_img personal_info.username personal_info.fullname -_id',
      })
      .sort({ publishedAt: -1 })
      .select('title banner_url description tags activity publishedAt _id')
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .lean();

    // Rename user_id to personal_info in the response
    const projectsWithAuthor = projects.map(project => ({
      ...project,
      personal_info: project.user_id.personal_info,
      user_id: undefined,
    }));

    return sendResponse(
      res,
      200,
      'Projects fetched successfully',
      projectsWithAuthor
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default getAllProjects;
