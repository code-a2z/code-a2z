import packageDetails from '../../package.json';

export const appVersion = packageDetails.version;

export const ORGANISATION_NAME =
  import.meta.env.VITE_ORGANISATION_NAME || 'Code A2Z';

// Load environment variables from .env file
export const VITE_SERVER_DOMAIN =
  import.meta.env.VITE_SERVER_DOMAIN || 'https://code-a2z-server.vercel.app'; // https://code-a2z.onrender.com for production

// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_DURATION: import.meta.env.VITE_ACCESS_TOKEN_DURATION || 15, // minutes
  REFRESH_TOKEN_DURATION: import.meta.env.VITE_REFRESH_TOKEN_DURATION || 7, // days
  ACCESS_TOKEN_NAME: import.meta.env.VITE_ACCESS_TOKEN_NAME || 'access_token',
  REFRESH_TOKEN_NAME:
    import.meta.env.VITE_REFRESH_TOKEN_NAME || 'refresh_token',
  SELECTED_ORG_ID: 'selected_org_id',
} as const;
