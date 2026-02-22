import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/response.js';
import { COOKIE_TOKEN, TOKEN_TYPE } from '../typings/index.js';
import { JWT_SECRET_ACCESS_KEY } from '../config/env.js';
import { isValidPermission } from '../constants/rbac.js';

/**
 * Verify JWT and attach decoded payload to req.user. Accepts any valid access token (pre-org or org-scoped).
 */
const authenticateUser = (req, res, next) => {
  const token =
    req.headers['authorization']?.split(' ')[1] ||
    req.cookies?.[COOKIE_TOKEN.ACCESS_TOKEN];

  if (!token) {
    return sendResponse(res, 401, 'Access Denied: No access token provided');
  }

  try {
    jwt.verify(token, JWT_SECRET_ACCESS_KEY, (err, decoded) => {
      if (err) {
        return sendResponse(
          res,
          401,
          'Access token invalid or expired. Please refresh.'
        );
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return sendResponse(res, 500, error.message || 'Token verification failed');
  }
};

/**
 * Requires token to be pre-org (no org selected yet). Use for select-org and refresh only.
 * Must run after authenticateUser.
 */
const authenticatePreOrgUser = (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, 401, 'Authentication required');
  }
  if (req.user.token_type !== TOKEN_TYPE.PRE_ORG) {
    return sendResponse(
      res,
      403,
      'This endpoint requires pre-org token. Use login or refresh token.'
    );
  }
  next();
};

/**
 * Requires token to be org-scoped (user has selected an org). Use for all in-org routes.
 * Ensures user of org A cannot access org B resources (org_id is in token and must be used for data scope).
 * Must run after authenticateUser.
 */
const requireOrgScope = (req, res, next) => {
  if (!req.user) {
    return sendResponse(res, 401, 'Authentication required');
  }
  if (req.user.token_type !== TOKEN_TYPE.ORG_SCOPED || !req.user.org_id) {
    return sendResponse(
      res,
      403,
      'Organization context required. Call select-org first.'
    );
  }
  next();
};

/**
 * Requires a specific permission (feature:action) for the current org.
 * Checks req.user.permissions (from org-scoped token) and that feature is in req.user.org_features.
 * Must run after requireOrgScope.
 * @param {string} feature - e.g. 'articles', 'chats'
 * @param {string} action - e.g. 'read', 'write', 'manage'
 */
const requirePermission = (feature, action) => {
  const permission = `${feature}:${action}`;
  if (!isValidPermission(permission)) {
    throw new Error(`Invalid permission: ${permission}`);
  }
  return (req, res, next) => {
    if (!req.user || !req.user.org_id) {
      return sendResponse(res, 403, 'Organization context required');
    }
    const permissions = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : [];
    const orgFeatures = Array.isArray(req.user.org_features)
      ? req.user.org_features
      : [];
    const hasFeature =
      feature === 'org' ||
      feature === 'admin_panel' ||
      orgFeatures.includes(feature);
    const hasPermission = permissions.includes(permission);
    if (!hasFeature || !hasPermission) {
      return sendResponse(res, 403, 'Insufficient permissions for this action');
    }
    next();
  };
};

export default authenticateUser;
export {
  authenticateUser,
  authenticatePreOrgUser,
  requireOrgScope,
  requirePermission,
};
