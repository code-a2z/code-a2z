export const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

export const COOKIE_TOKEN = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const USER_ROLES = {
  USER: 'user',
  MAINTAINER: 'maintainer',
  ADMIN: 'admin',
} as const;

export const PROJECT_PERMISSION_MODES = {
  EDIT: 'edit',
  READ: 'read',
} as const;

export const NOTIFICATION_TYPES = {
  ALL: 'all',
  LIKE: 'like',
  COMMENT: 'comment',
  REPLY: 'reply',
} as const;

export const COLLABORATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
} as const;

export const FEEDBACK_CATEGORY = {
  ARTICLES: 'articles',
  CHATS: 'chats',
  CODE: 'code',
} as const;
