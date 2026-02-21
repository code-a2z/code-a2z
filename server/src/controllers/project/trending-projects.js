/**
 * GET /api/project/trending - Get trending projects
 * @returns {Object[]} Array of trending projects
 */

import PROJECT from '../../models/project.model.js';
import { sendResponse } from '../../utils/response.js';

const trendingProjects = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  try {
    const projects = await PROJECT.find({ is_draft: false, org_id })
      .populate(
        'user_id',
        'personal_info.profile_img personal_info.username personal_info.fullname -_id'
      )
      .sort({
        'activity.total_read': -1,
        'activity.total_likes': -1,
        publishedAt: -1,
      })
      .select('title publishedAt _id')
      .limit(5)
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
      'Trending projects fetched successfully',
      projectsWithAuthor
    );
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default trendingProjects;
