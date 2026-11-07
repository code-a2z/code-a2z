export const TOKEN_TYPES = {
  PRE_ORG: 'pre_org',
  ORG_SCOPED: 'org_scoped',
} as const;

export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
export const PASSWORD_REQUIREMENTS =
  'Password must be 6-20 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
