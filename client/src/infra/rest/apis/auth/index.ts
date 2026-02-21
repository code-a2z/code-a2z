import { patch, post } from '../..';
import { ApiResponse, BaseApiResponse } from '../../typings';
import {
  signUpPayload,
  loginPayload,
  changePasswordPayload,
  LoginSignupResponseData,
  selectOrgPayload,
  SelectOrgResponseData,
} from './typing';

export const signUp = async (payload: signUpPayload) => {
  return post<signUpPayload, ApiResponse<LoginSignupResponseData>>(
    '/api/auth/signup',
    false,
    payload
  );
};

export const login = async (payload: loginPayload) => {
  return post<loginPayload, ApiResponse<LoginSignupResponseData>>(
    '/api/auth/login',
    false,
    payload
  );
};

export const selectOrg = async (payload: selectOrgPayload) => {
  return post<selectOrgPayload, ApiResponse<SelectOrgResponseData>>(
    '/api/auth/select-org',
    true,
    payload
  );
};

export const refreshToken = async () => {
  return post<undefined, ApiResponse<{ access_token: string }>>(
    `/api/auth/refresh`,
    true
  );
};

export const logout = async () => {
  return post<undefined, BaseApiResponse>(`/api/auth/logout`, true);
};

export const changePassword = async (
  changePasswordPayload: changePasswordPayload
) => {
  return patch<changePasswordPayload, BaseApiResponse>(
    `/api/auth/change-password`,
    true,
    changePasswordPayload
  );
};
