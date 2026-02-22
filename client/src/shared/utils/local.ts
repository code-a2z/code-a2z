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

const ORGS_LIST_KEY = 'orgs_list';

export const getOrgsList = (): Array<{
  org_id: string;
  name: string;
  role: string;
}> | null => {
  try {
    const raw = lookInLocal(ORGS_LIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Array<{
      org_id: string;
      name: string;
      role: string;
    }>;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setOrgsList = (
  orgs: Array<{ org_id: string; name: string; role: string }>
) => {
  storeInLocal(ORGS_LIST_KEY, JSON.stringify(orgs));
};

export const clearOrgsList = () => {
  removeFromLocal(ORGS_LIST_KEY);
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
