/**
 * POST /api/project/create - Create or update a project
 * @param {string} title - Project title
 * @param {string} banner_url - Banner image URL
 * @param {string} description - Project description (max 200 chars)
 * @param {string} repository_url - Repository URL
 * @param {string} live_url - Project live URL
 * @param {string[]} tags - Array of tags (max 10)
 * @param {object[]} content_blocks - EditorJS content blocks
 * @param {boolean} is_draft - Is draft (true/false). If true, some fields can be empty
 * @param {string} [project_id] - If present, updates existing project
 * @returns {Object} Success message and project id
 */

import PROJECT from '../../models/project.model.js';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';

const createProject = async (req, res) => {
  const user_id = req.user.user_id;
  const org_id = req.user.org_id;
  if (!org_id) {
    return sendResponse(res, 403, 'Organization context required');
  }
  let {
    title,
    banner_url,
    description,
    repository_url,
    live_url,
    tags,
    content_blocks,
    is_draft,
    project_id,
  } = req.body;

  if (!title || !title.trim().length) {
    return sendResponse(res, 400, 'You must provide a title');
  }

  if (is_draft === false || is_draft === 'false') {
    if (!banner_url || !banner_url.trim().length) {
      return sendResponse(res, 400, 'Project banner required');
    }
    if (
      !description ||
      !description.trim().length ||
      description.length > 200
    ) {
      return sendResponse(
        res,
        400,
        'Project description required (max 200 chars)'
      );
    }
    if (!repository_url || !repository_url.trim().length) {
      return sendResponse(res, 400, 'Project repository required');
    }
    if (!tags?.length || tags.length > 10) {
      return sendResponse(res, 400, 'Provide up to 10 tags');
    }
    if (
      !(
        (Array.isArray(content_blocks) && content_blocks.length > 0) ||
        (!Array.isArray(content_blocks) && !!content_blocks?.blocks?.length)
      )
    ) {
      return sendResponse(res, 400, 'Project content required');
    }
  }

  // Normalize tags
  tags = tags?.map(tag => tag.toLowerCase()) || [];

  try {
    if (project_id) {
      // Update existing project (must belong to current org)
      const updated_project = await PROJECT.findOneAndUpdate(
        { _id: project_id, org_id },
        {
          title,
          banner_url,
          description,
          repository_url,
          live_url,
          tags,
          content_blocks,
          is_draft: is_draft === 'true' || is_draft === true,
        },
        { new: true }
      );
      if (!updated_project) {
        return sendResponse(res, 404, 'Project not found to update');
      }
      return sendResponse(res, 200, 'Project updated successfully', {
        id: project_id,
      });
    } else {
      // Create new project (org-scoped)
      const project = new PROJECT({
        title,
        banner_url,
        description,
        repository_url,
        live_url,
        tags,
        content_blocks,
        user_id,
        org_id,
        is_draft: is_draft === 'true' || is_draft === true,
      });

      const saved_project = await project.save();
      // Update user's total posts and project list
      if (is_draft === false || is_draft === 'false') {
        await USER.findOneAndUpdate(
          { _id: user_id },
          {
            $inc: { 'account_info.total_posts': 1 },
            $push: { project_ids: saved_project._id },
          }
        );
      } else {
        await USER.findOneAndUpdate(
          { _id: user_id },
          { $push: { project_ids: saved_project._id } }
        );
      }
      return sendResponse(res, 200, 'Project created successfully', {
        id: saved_project._id,
      });
    }
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal server error');
  }
};

export default createProject;
