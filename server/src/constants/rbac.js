/**
 * RBAC constants: features, permissions, org membership roles, and role–permission mapping.
 * Used for org-scoped authorization. No implicit grants; every allowed action is explicit.
 */

/** Application features (org-level toggles). Org has enabled_features[] subset of these. */
export const FEATURES = Object.freeze({
  ARTICLES: 'articles',
  CHATS: 'chats',
  NOTES: 'notes',
  CODE: 'code',
  COLLABORATION: 'collaboration',
  NOTIFICATIONS: 'notifications',
  FEEDBACK: 'feedback',
});

/** All feature slugs as array (for validation and iteration). */
export const FEATURE_LIST = Object.values(FEATURES);

/** Permission actions (suffix after feature). */
export const PERMISSION_ACTIONS = Object.freeze({
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage', // e.g. manage members, settings for the feature or org
});

/**
 * Full permission strings: "feature:action".
 * Used in JWT/middleware checks. Only these values are valid.
 */
export const PERMISSIONS = Object.freeze({
  // Articles (projects/posts)
  ARTICLES_READ: 'articles:read',
  ARTICLES_WRITE: 'articles:write',
  ARTICLES_DELETE: 'articles:delete',
  ARTICLES_MANAGE: 'articles:manage',
  // Chats
  CHATS_READ: 'chats:read',
  CHATS_WRITE: 'chats:write',
  CHATS_DELETE: 'chats:delete',
  CHATS_MANAGE: 'chats:manage',
  // Notes / collections
  NOTES_READ: 'notes:read',
  NOTES_WRITE: 'notes:write',
  NOTES_DELETE: 'notes:delete',
  NOTES_MANAGE: 'notes:manage',
  // Code
  CODE_READ: 'code:read',
  CODE_WRITE: 'code:write',
  CODE_DELETE: 'code:delete',
  CODE_MANAGE: 'code:manage',
  // Collaboration
  COLLABORATION_READ: 'collaboration:read',
  COLLABORATION_WRITE: 'collaboration:write',
  COLLABORATION_MANAGE: 'collaboration:manage',
  // Notifications
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_WRITE: 'notifications:write',
  NOTIFICATIONS_MANAGE: 'notifications:manage',
  // Feedback
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_WRITE: 'feedback:write',
  FEEDBACK_MANAGE: 'feedback:manage',
  // Org-level (not feature-gated; only for org admins)
  ORG_MANAGE: 'org:manage',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_BILLING: 'org:manage_billing',
});

/** All permission strings as array. */
export const PERMISSION_LIST = Object.values(PERMISSIONS);

/** Organization membership roles (per-org role for a user). */
export const ORG_MEMBER_ROLES = Object.freeze({
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
});

export const ORG_MEMBER_ROLE_LIST = Object.values(ORG_MEMBER_ROLES);

/**
 * Role–permission mapping: which role gets which permissions.
 * Viewer: read-only for features. Member: read + write. Admin: all permissions for the org.
 */
const VIEWER_PERMISSIONS = [
  PERMISSIONS.ARTICLES_READ,
  PERMISSIONS.CHATS_READ,
  PERMISSIONS.NOTES_READ,
  PERMISSIONS.CODE_READ,
  PERMISSIONS.COLLABORATION_READ,
  PERMISSIONS.NOTIFICATIONS_READ,
  PERMISSIONS.FEEDBACK_READ,
];

const MEMBER_PERMISSIONS = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.ARTICLES_WRITE,
  PERMISSIONS.ARTICLES_DELETE,
  PERMISSIONS.CHATS_WRITE,
  PERMISSIONS.CHATS_DELETE,
  PERMISSIONS.NOTES_WRITE,
  PERMISSIONS.NOTES_DELETE,
  PERMISSIONS.CODE_WRITE,
  PERMISSIONS.CODE_DELETE,
  PERMISSIONS.COLLABORATION_WRITE,
  PERMISSIONS.NOTIFICATIONS_WRITE,
  PERMISSIONS.FEEDBACK_WRITE,
];

const ADMIN_PERMISSIONS = [
  ...MEMBER_PERMISSIONS,
  PERMISSIONS.ARTICLES_MANAGE,
  PERMISSIONS.CHATS_MANAGE,
  PERMISSIONS.NOTES_MANAGE,
  PERMISSIONS.CODE_MANAGE,
  PERMISSIONS.COLLABORATION_MANAGE,
  PERMISSIONS.NOTIFICATIONS_MANAGE,
  PERMISSIONS.FEEDBACK_MANAGE,
  PERMISSIONS.ORG_MANAGE,
  PERMISSIONS.ORG_MANAGE_MEMBERS,
  PERMISSIONS.ORG_MANAGE_BILLING,
];

/**
 * Map org membership role -> list of permission strings.
 * Used when issuing tokens or checking requirePermission.
 */
export const ROLE_PERMISSIONS = Object.freeze({
  [ORG_MEMBER_ROLES.VIEWER]: [...VIEWER_PERMISSIONS],
  [ORG_MEMBER_ROLES.MEMBER]: [...MEMBER_PERMISSIONS],
  [ORG_MEMBER_ROLES.ADMIN]: [...ADMIN_PERMISSIONS],
});

/**
 * Get permissions for a role. Returns empty array for unknown role (fail closed).
 */
export function getPermissionsForRole(role) {
  if (!role || typeof role !== 'string') return [];
  const perms = ROLE_PERMISSIONS[role];
  return Array.isArray(perms) ? [...perms] : [];
}

/**
 * Check if a permission string is valid (exists in PERMISSION_LIST).
 */
export function isValidPermission(permission) {
  return typeof permission === 'string' && PERMISSION_LIST.includes(permission);
}
