/** Route for org selection (token present, no selectedOrgId). */
export const ROUTE_SELECT_ORG = '/select-org';

/** Public route to accept org invite (token in query). */
export const ROUTE_ACCEPT_INVITE = '/accept-invite';

/** Public route to request a new organization. */
export const ROUTE_REQUEST_ORG = '/request-org';

/** Public route to set password after org approval (token in query). */
export const ROUTE_SET_PASSWORD = '/set-password';

export enum ROUTES_PAGE_V1 {
  HOME = 'home',
  CHATS = 'chats',
  NOTES = 'notes',
  CODE = 'code',
  SETTINGS = 'settings',
  ADMIN = 'admin',
}

export enum ROUTES_V1 {
  HOME = '/v1/home',
  CHATS = '/v1/chats',
  NOTES = '/v1/notes',
  CODE = '/v1/code',
  SETTINGS = '/v1/settings',
  ADMIN = '/v1/admin',
}

export enum ROUTES_HOME_V1 {
  PROJECT = '/:project_id',
  EDITOR = '/editor',
  EDITOR_WITH_ID = '/editor/:project_id',
}

export enum ROUTES_SETTINGS_V1 {
  PROFILE = '/profile',
  NOTIFICATION = '/notification',
  MANAGE_ARTICLES = '/manage-articles',
  INTEGRATIONS = '/integrations',
  TEAM = '/team',
}

export enum ROUTES_SETTINGS_INTEGRATIONS_V1 {
  OPENAI = '/openai',
}
