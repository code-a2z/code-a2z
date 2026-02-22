/**
 * POST /api/organization/request - Public endpoint to request a new organization.
 * No auth. Creates Organization with status 'pending'. Validates slug uniqueness
 * and one pending request per email.
 */

import ORGANIZATION from '../../models/organization.model.js';
import { sendResponse } from '../../utils/response.js';

const requestOrganization = async (req, res) => {
  const { name, slug, requested_by_email, requested_by_name } = req.body;

  if (!name || !slug || !requested_by_email) {
    return sendResponse(
      res,
      400,
      'name, slug, and requested_by_email are required'
    );
  }

  const email = String(requested_by_email).trim().toLowerCase();
  const nameTrimmed = String(name).trim();
  const slugTrimmed = String(slug).trim().toLowerCase();

  if (!email) {
    return sendResponse(res, 400, 'requested_by_email cannot be empty');
  }
  if (!nameTrimmed) {
    return sendResponse(res, 400, 'name cannot be empty');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugTrimmed)) {
    return sendResponse(
      res,
      400,
      'Slug must be lowercase alphanumeric with optional hyphens'
    );
  }

  try {
    const existingSlug = await ORGANIZATION.findOne({
      slug: slugTrimmed,
    }).lean();
    if (existingSlug) {
      return sendResponse(
        res,
        409,
        'An organization with this slug already exists'
      );
    }

    const existingPending = await ORGANIZATION.findOne({
      status: 'pending',
      requested_by_email: email,
    }).lean();
    if (existingPending) {
      return sendResponse(
        res,
        409,
        'You already have a pending organization request for this email'
      );
    }

    const org = await ORGANIZATION.create({
      name: nameTrimmed,
      slug: slugTrimmed,
      status: 'pending',
      requested_by_email: email,
      requested_by_name: requested_by_name
        ? String(requested_by_name).trim()
        : undefined,
    });

    return sendResponse(
      res,
      201,
      "Request submitted. You'll be notified once reviewed.",
      {
        org_id: org._id,
      }
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = err.message.includes('requested_by_email')
        ? 'email'
        : 'slug';
      return sendResponse(
        res,
        409,
        field === 'email'
          ? 'You already have a pending organization request for this email'
          : 'An organization with this slug already exists'
      );
    }
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default requestOrganization;
