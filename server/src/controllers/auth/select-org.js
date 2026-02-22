/**
 * POST /api/auth/select-org - Select organization and receive org-scoped token.
 * Requires pre-org access token. Verifies user is member of org_id, then issues
 * org-scoped access token with role, permissions (filtered by org enabled_features), and org_features.
 */

import mongoose from 'mongoose';
import ORGANIZATION_MEMBER from '../../models/organization-member.model.js';
import USER from '../../models/user.model.js';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { sendResponse } from '../../utils/response.js';
import { generateOrgScopedToken } from './utils/index.js';
import {
  getPermissionsForRole,
  PERMISSIONS,
  ORG_MEMBER_ROLES,
} from '../../constants/rbac.js';
import { PLATFORM_ADMIN_ORG_ID } from '../../config/env.js';

/**
 * Filter permissions to only those for features enabled in the org.
 * Permission format: "feature:action" (e.g. "articles:read"). Org-level
 * permissions (org:manage_members, org:manage_billing, org:manage) are always
 * kept and not gated by enabled_features.
 */
function filterPermissionsByOrgFeatures(permissions, enabledFeatures) {
  const featureSet = new Set(enabledFeatures || []);
  return permissions.filter(perm => {
    const feature = typeof perm === 'string' ? perm.split(':')[0] : null;
    if (!feature) return false;
    if (feature === 'org' || feature === 'admin_panel') return true;
    return featureSet.has(feature);
  });
}

const selectOrg = async (req, res) => {
  const { org_id } = req.body;

  if (!org_id) {
    return sendResponse(res, 400, 'org_id is required');
  }

  if (!mongoose.Types.ObjectId.isValid(org_id)) {
    return sendResponse(res, 400, 'org_id must be a valid MongoDB ObjectId');
  }

  const userId = req.user?.user_id;
  const subscriberId = req.user?.subscriber_id;
  const email = req.user?.email;

  if (!userId || !subscriberId) {
    return sendResponse(res, 401, 'Invalid token: missing user context');
  }

  try {
    const membership = await ORGANIZATION_MEMBER.findOne({
      user_id: userId,
      org_id,
    })
      .populate('org_id', 'name slug enabled_features status')
      .lean();

    if (!membership || !membership.org_id) {
      return sendResponse(
        res,
        403,
        'You are not a member of this organization'
      );
    }

    const org = membership.org_id;
    const orgStatus = org.status;
    if (orgStatus && orgStatus !== 'active') {
      return sendResponse(
        res,
        403,
        'This organization is not available for access'
      );
    }
    const role = membership.role;
    const enabledFeatures = org.enabled_features || [];

    let rolePermissions = getPermissionsForRole(role);
    if (
      PLATFORM_ADMIN_ORG_ID &&
      String(org._id) === String(PLATFORM_ADMIN_ORG_ID) &&
      role === ORG_MEMBER_ROLES.OWNER
    ) {
      rolePermissions = [...rolePermissions, PERMISSIONS.ADMIN_PANEL];
    }
    const permissions = filterPermissionsByOrgFeatures(
      rolePermissions,
      enabledFeatures
    );

    const tokenPayload = {
      user_id: userId,
      org_id: org._id,
      subscriber_id: subscriberId,
      email: email || null,
      role,
      permissions,
      org_features: enabledFeatures,
    };

    const { access_token } = generateOrgScopedToken(tokenPayload);

    const userDoc = await USER.findById(userId)
      .select(
        'personal_info.fullname personal_info.username personal_info.profile_img'
      )
      .lean();
    const subscriberDoc = await SUBSCRIBER.findById(subscriberId)
      .select('email')
      .lean();

    const user = {
      id: userId,
      fullname: userDoc?.personal_info?.fullname,
      username: userDoc?.personal_info?.username,
      email: subscriberDoc?.email,
      profile_img: userDoc?.personal_info?.profile_img,
    };

    return sendResponse(res, 200, 'Organization selected', {
      access_token,
      user,
      role,
      permissions,
      org_features: enabledFeatures,
      org: { org_id: org._id, name: org.name, slug: org.slug },
    });
  } catch (err) {
    return sendResponse(res, 500, err.message || 'Internal Server Error');
  }
};

export default selectOrg;
