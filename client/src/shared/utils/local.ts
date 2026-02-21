import { TOKEN_CONFIG } from '../../config/env';

export const storeInLocal = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const lookInLocal = (key: string) => {
  return localStorage.getItem(key);
};

export const removeFromLocal = (key: string) => {
  localStorage.removeItem(key);
};

export const getSelectedOrgId = (): string | null => {
  return lookInLocal(TOKEN_CONFIG.SELECTED_ORG_ID);
};

export const setSelectedOrgId = (orgId: string) => {
  storeInLocal(TOKEN_CONFIG.SELECTED_ORG_ID, orgId);
};

export const clearSelectedOrgId = () => {
  removeFromLocal(TOKEN_CONFIG.SELECTED_ORG_ID);
};

export const logOutUser = () => {
  localStorage.clear();
};

export const getAccessToken = () => {
  return lookInLocal(TOKEN_CONFIG.ACCESS_TOKEN_NAME);
};

export const setAccessToken = (token: string) => {
  storeInLocal(TOKEN_CONFIG.ACCESS_TOKEN_NAME, token);
};
