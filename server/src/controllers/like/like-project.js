/**
 * POST /api/like - Like or unlike a project
 * @param {string} project_id - Project ID (body param)
 * @param {boolean} is_liked_by_user - Like status (body param)
 * @returns {Object} Like status and total likes
 */

import PROJECT from '../../models/project.model.js';
import NOTIFICATION from '../../models/notification.model.js';
import { sendResponse } from '../../utils/response.js';
import { NOTIFICATION_TYPES } from '../../typings/index.js';

const likeProject = async (req, res) => {
  const org_id = req.user?.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  try {
    const user_id = req.user.user_id;
    const { project_id, is_liked_by_user } = req.body;

    if (!project_id) {
      return sendResponse(res, 400, 'Project ID is required');
    }

    const incrementVal = is_liked_by_user ? 1 : -1;

    // Update project like count (only projects in current org)
    const project = await PROJECT.findOneAndUpdate(
      { _id: project_id, org_id },
      { $inc: { 'activity.total_likes': incrementVal } },
      { new: true }
    );

    if (!project) {
      return sendResponse(res, 404, 'Project not found');
    }

    // Handle like / unlike notifications (org-scoped)
    if (is_liked_by_user) {
      await NOTIFICATION.create({
        type: NOTIFICATION_TYPES.LIKE,
        project_id,
        user_id: user_id,
        author_id: project.user_id,
        org_id,
      });

      return sendResponse(res, 200, 'Project liked successfully!', {
        liked_by_user: true,
        total_likes: project.activity.total_likes,
      });
    } else {
      await NOTIFICATION.findOneAndDelete({
        type: NOTIFICATION_TYPES.LIKE,
        project_id,
        user_id: user_id,
        author_id: project.user_id,
        org_id,
      });

      return sendResponse(res, 200, 'Project unliked successfully', {
        liked_by_user: false,
        total_likes: project.activity.total_likes,
      });
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default likeProject;
