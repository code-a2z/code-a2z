import axios from 'axios';
import { refreshToken } from '../../infra/rest/apis/auth';
import { getAccessToken, setAccessToken, clearSelectedOrgId } from './local';

let refreshPromise: Promise<boolean> | null = null;
let isInterceptorSetup = false;

// Perform the actual token refresh
const performTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshResponse = await refreshToken();
    if (refreshResponse.status === 'success') {
      const newToken = refreshResponse?.data?.access_token || '';
      if (newToken) {
        setAccessToken(newToken);
        // Trigger a custom event to notify token update
        window.dispatchEvent(
          new CustomEvent('token-refreshed', { detail: { token: newToken } })
        );
        return true;
      }
      return false;
    } else {
      console.log('Token refresh failed:', refreshResponse);
      // Trigger logout event
      window.dispatchEvent(new CustomEvent('token-refresh-failed'));
      return false;
    }
  } catch (error: unknown) {
    // Check if the error is due to missing refresh token
    let errorMessage = '';
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string };
      errorMessage = data.message || '';
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      errorMessage = String((error as { message?: unknown }).message || '');
    }

    const isNoRefreshToken =
      errorMessage.includes('No refresh token') ||
      errorMessage.includes('refresh token');

    if (isNoRefreshToken) {
      // No refresh token available - don't log error, just return false
      // This happens when refresh token cookie is missing/expired
      console.log('Refresh token not available');
      window.dispatchEvent(new CustomEvent('token-refresh-failed'));
      return false;
    }

    console.error('Token refresh error:', error);
    // Trigger logout event for other errors
    window.dispatchEvent(new CustomEvent('token-refresh-failed'));
    return false;
  }
};

// Handle token refresh with deduplication
const handleTokenRefresh = async (): Promise<boolean> => {
  // If already refreshing, wait for the existing refresh to complete
  if (refreshPromise) {
    return await refreshPromise;
  }

  // Start new refresh process
  refreshPromise = performTokenRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    refreshPromise = null;
  }
};

// Setup axios response interceptor to handle 401 errors
const setupAxiosInterceptor = () => {
  if (isInterceptorSetup) return;

  // Response interceptor to handle 401 errors
  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // If error is 401 and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Don't retry refresh token endpoint itself
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          window.dispatchEvent(new CustomEvent('token-refresh-failed'));
          return Promise.reject(error);
        }

        // Try to refresh token
        const refreshSuccess = await handleTokenRefresh();

        if (refreshSuccess) {
          // Retry original request with new token
          const newToken = getAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }

        // If refresh failed, reject the request
        window.dispatchEvent(new CustomEvent('token-refresh-failed'));
        return Promise.reject(error);
      }

      // 403 Organization context required: token is pre-org or org scope lost; send user to org selection
      if (error.response?.status === 403) {
        const message =
          (error.response?.data as { message?: string })?.message ?? '';
        const isOrgRequired =
          message.includes('Organization context required') ||
          message.includes('org required') ||
          message.includes('select-org');
        if (isOrgRequired) {
          clearSelectedOrgId();
          window.dispatchEvent(new CustomEvent('org-context-required'));
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  // Request interceptor to add token to requests
  axios.interceptors.request.use(
    config => {
      const token = getAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  isInterceptorSetup = true;
};

// Setup automatic token refresh on app start
export const setupTokenRefresh = () => {
  // Setup axios interceptors first
  setupAxiosInterceptor();

  // Note: We don't do proactive periodic refresh anymore
  // Token refresh will happen automatically when:
  // 1. A request returns 401 (handled by response interceptor)
  // 2. Manual refresh is called via refreshAuthToken()
  // This prevents trying to refresh when refresh token cookie doesn't exist
};
