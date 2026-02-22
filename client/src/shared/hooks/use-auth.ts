import { useSetAtom, useAtom, useAtomValue } from 'jotai';
import { useEffect, useState, useCallback } from 'react';
import { UserAtom } from '../../infra/states/user';
import { TokenAtom } from '../../infra/states/auth';
import {
  SelectedOrgIdAtom,
  OrgsListAtom,
  PermissionsAtom,
  OrgFeaturesAtom,
  OrgAtom,
  type OrgListItem,
} from '../../infra/states/org';
import {
  refreshToken,
  selectOrg as selectOrgApi,
} from '../../infra/rest/apis/auth';
import { getCurrentUser } from '../../infra/rest/apis/user';
import {
  getAccessToken,
  removeFromLocal,
  setAccessToken,
  getSelectedOrgId,
  setSelectedOrgId,
  clearSelectedOrgId,
  getOrgsList,
  setOrgsList,
  clearOrgsList,
} from '../utils/local';
import { TOKEN_CONFIG } from '../../config/env';

// Deduplicate initial auth load: only one refresh + select-org runs app-wide.
let sharedAuthInitPromise: Promise<void> | null = null;

export const useAuth = () => {
  const [token, setToken] = useAtom(TokenAtom);
  const user = useAtomValue(UserAtom);
  const setUser = useSetAtom(UserAtom);
  const [selectedOrgId, setSelectedOrgIdState] = useAtom(SelectedOrgIdAtom);
  const [orgs, setOrgsState] = useAtom(OrgsListAtom);
  const setPermissions = useSetAtom(PermissionsAtom);
  const setOrgFeatures = useSetAtom(OrgFeaturesAtom);
  const setOrg = useSetAtom(OrgAtom);
  const permissions = useAtomValue(PermissionsAtom);
  const orgFeatures = useAtomValue(OrgFeaturesAtom);
  const org = useAtomValue(OrgAtom);
  const [initialized, setInitialized] = useState<boolean>(false);

  const clearToken = useCallback((): void => {
    removeFromLocal(TOKEN_CONFIG.ACCESS_TOKEN_NAME);
    setToken(null);
  }, [setToken]);

  const logout = useCallback(() => {
    sharedAuthInitPromise = null;
    setToken(null);
    setUser(null);
    setSelectedOrgIdState(null);
    setOrgsState([]);
    setPermissions([]);
    setOrgFeatures([]);
    setOrg(null);
    clearToken();
    clearSelectedOrgId();
    clearOrgsList();
  }, [
    setToken,
    setUser,
    setSelectedOrgIdState,
    setOrgsState,
    setPermissions,
    setOrgFeatures,
    setOrg,
    clearToken,
  ]);

  // Initialize: sync token and selectedOrgId from storage. Do NOT call getCurrentUser when no selectedOrgId.
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getAccessToken();
      const storedOrgId = getSelectedOrgId();
      const storedOrgs = getOrgsList();

      if (!accessToken) {
        setInitialized(true);
        return;
      }

      setToken(accessToken);

      if (!storedOrgId) {
        setSelectedOrgIdState(null);
        if (storedOrgs?.length) {
          setOrgsState(storedOrgs);
        }
        setInitialized(true);
        return;
      }

      // Reload with persisted org: one refresh + select-org for the whole app
      const runInit = async () => {
        try {
          const refreshResponse = await refreshToken();
          if (
            refreshResponse.status !== 'success' ||
            !refreshResponse?.data?.access_token
          ) {
            clearToken();
            clearSelectedOrgId();
            setSelectedOrgIdState(null);
            setPermissions([]);
            setOrgFeatures([]);
            setOrg(null);
            if (storedOrgs?.length) setOrgsState(storedOrgs);
            return;
          }
          const newToken = refreshResponse.data.access_token;
          setAccessToken(newToken);
          setToken(newToken);

          const response = await selectOrgApi({ org_id: storedOrgId });
          if (response.status === 'success' && response.data) {
            const d = response.data;
            setAccessToken(d.access_token);
            setToken(d.access_token);
            setSelectedOrgIdState(d.org.org_id);
            setSelectedOrgId(d.org.org_id);
            setPermissions(d.permissions ?? []);
            setOrgFeatures(d.org_features ?? []);
            setOrg(d.org);
            setUser(
              d.user
                ? {
                    _id: d.user.id,
                    personal_info: {
                      fullname: d.user.fullname ?? '',
                      username: d.user.username ?? '',
                      profile_img: d.user.profile_img ?? '',
                      subscriber_id: '',
                      bio: '',
                    },
                    social_links: {
                      youtube: '',
                      instagram: '',
                      facebook: '',
                      x: '',
                      github: '',
                      linkedin: '',
                      website: '',
                    },
                    account_info: { total_posts: 0, total_reads: 0 },
                    role: d.role,
                    project_ids: [],
                    collaborated_projects_ids: [],
                    collections_ids: [],
                    joinedAt: '',
                    updatedAt: '',
                  }
                : null
            );
            try {
              const meRes = await getCurrentUser();
              if (meRes.status === 'success' && meRes.data) {
                setUser(meRes.data);
              }
            } catch {
              // Keep limited user from select-org
            }
          } else {
            clearSelectedOrgId();
            setSelectedOrgIdState(null);
            if (storedOrgs?.length) setOrgsState(storedOrgs);
          }
        } catch {
          clearSelectedOrgId();
          setSelectedOrgIdState(null);
          if (storedOrgs?.length) setOrgsState(storedOrgs);
        }
      };

      if (sharedAuthInitPromise) {
        await sharedAuthInitPromise;
      } else {
        sharedAuthInitPromise = runInit();
        await sharedAuthInitPromise;
      }
      setInitialized(true);
    };

    initializeAuth();
  }, [
    setToken,
    setSelectedOrgIdState,
    setOrgsState,
    setPermissions,
    setOrgFeatures,
    setOrg,
    setUser,
  ]);

  const login = useCallback(
    (accessToken: string) => {
      setToken(accessToken);
    },
    [setToken]
  );

  /**
   * Switch organization: refresh to get pre-org token, clear org context.
   * Returns true if caller should navigate to /select-org; false if refresh failed and user was logged out.
   */
  const switchOrg = useCallback(async (): Promise<boolean> => {
    try {
      const refreshResponse = await refreshToken();
      if (
        refreshResponse.status !== 'success' ||
        !refreshResponse?.data?.access_token
      ) {
        logout();
        return false;
      }
      const newToken = refreshResponse.data.access_token;
      setAccessToken(newToken);
      setToken(newToken);
      clearSelectedOrgId();
      setSelectedOrgIdState(null);
      setPermissions([]);
      setOrgFeatures([]);
      setOrg(null);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [
    setToken,
    setSelectedOrgIdState,
    setPermissions,
    setOrgFeatures,
    setOrg,
    logout,
  ]);

  /** Call after login/signup success: persist orgs and clear selectedOrgId so user sees org picker. */
  const setOrgsFromLogin = useCallback(
    (orgList: OrgListItem[]) => {
      setOrgsState(orgList);
      setOrgsList(orgList);
      clearSelectedOrgId();
      setSelectedOrgIdState(null);
    },
    [setOrgsState, setSelectedOrgIdState]
  );

  const selectOrg = useCallback(
    async (orgId: string) => {
      const response = await selectOrgApi({ org_id: orgId });
      if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'Failed to select organization');
      }
      const d = response.data;
      setAccessToken(d.access_token);
      setToken(d.access_token);
      setSelectedOrgIdState(d.org.org_id);
      setSelectedOrgId(d.org.org_id);
      setPermissions(d.permissions ?? []);
      setOrgFeatures(d.org_features ?? []);
      setOrg(d.org);
      setUser(
        d.user
          ? {
              _id: d.user.id,
              personal_info: {
                fullname: d.user.fullname ?? '',
                username: d.user.username ?? '',
                profile_img: d.user.profile_img ?? '',
                subscriber_id: '',
                bio: '',
              },
              social_links: {
                youtube: '',
                instagram: '',
                facebook: '',
                x: '',
                github: '',
                linkedin: '',
                website: '',
              },
              account_info: { total_posts: 0, total_reads: 0 },
              role: d.role,
              project_ids: [],
              collaborated_projects_ids: [],
              collections_ids: [],
              joinedAt: '',
              updatedAt: '',
            }
          : null
      );
      try {
        const meRes = await getCurrentUser();
        if (meRes.status === 'success' && meRes.data) {
          setUser(meRes.data);
        }
      } catch {
        // Keep limited user from select-org
      }
    },
    [
      setToken,
      setSelectedOrgIdState,
      setPermissions,
      setOrgFeatures,
      setOrg,
      setUser,
    ]
  );

  // Listen for token refresh events from api-interceptor (refresh returns pre-org token)
  useEffect(() => {
    const handleTokenRefreshed = (event: CustomEvent) => {
      const newToken = event.detail?.token;
      if (newToken) {
        setToken(newToken);
      }
    };

    const handleTokenRefreshFailed = () => {
      logout();
    };

    window.addEventListener(
      'token-refreshed',
      handleTokenRefreshed as EventListener
    );
    window.addEventListener('token-refresh-failed', handleTokenRefreshFailed);

    return () => {
      window.removeEventListener(
        'token-refreshed',
        handleTokenRefreshed as EventListener
      );
      window.removeEventListener(
        'token-refresh-failed',
        handleTokenRefreshFailed
      );
    };
  }, [setToken, logout]);

  const refreshAuthToken = async (): Promise<boolean> => {
    const storedToken = getAccessToken();
    if (!token && !storedToken) {
      logout();
      return false;
    }

    try {
      const response = await refreshToken();
      if (response.status === 'success' && response?.data?.access_token) {
        const newToken = response.data.access_token;
        setAccessToken(newToken);
        setToken(newToken);
        return true;
      }
      logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      const currentToken = getAccessToken();
      if (!currentToken) {
        logout();
      }
      return false;
    }
  };

  const isAuthenticated = useCallback(() => !!token, [token]);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  return {
    token,
    setToken,
    clearToken,
    login,
    logout,
    refreshAuthToken,
    isAuthenticated,
    getAuthHeaders,
    initialized,
    selectedOrgId,
    user,
    permissions,
    orgFeatures,
    org,
    orgs,
    setOrgsFromLogin,
    selectOrg,
    switchOrg,
  };
};
