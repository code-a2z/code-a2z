export const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

export const COOKIE_TOKEN = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

/** JWT token scope: pre_org = before org selection; org_scoped = after select-org. */
export const TOKEN_TYPE = {
  PRE_ORG: 'pre_org',
  ORG_SCOPED: 'org_scoped',
};

export const USER_ROLES = {
  USER: 'user',
  MAINTAINER: 'maintainer',
  ADMIN: 'admin',
};

export const PROJECT_PERMISSION_MODES = {
  EDIT: 'edit',
  READ: 'read',
};

export const NOTIFICATION_TYPES = {
  ALL: 'all',
  LIKE: 'like',
  COMMENT: 'comment',
  REPLY: 'reply',
};

export const COLLABORATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};

export const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
};

export const FEEDBACK_CATEGORY = {
  ARTICLES: 'articles',
  CHATS: 'chats',
  CODE: 'code',
};
