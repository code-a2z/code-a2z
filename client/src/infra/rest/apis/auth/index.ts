import { get, patch, post } from '../..';
import { ApiResponse, BaseApiResponse } from '../../typings';
import {
  signUpPayload,
  loginPayload,
  changePasswordPayload,
  LoginSignupResponseData,
  selectOrgPayload,
  SelectOrgResponseData,
  AcceptInviteInfoResponseData,
  AcceptInvitePayload,
  AcceptInviteResponseData,
  SetPasswordInfoResponseData,
  SetPasswordAfterApprovalPayload,
  SetPasswordAfterApprovalResponseData,
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

export const getAcceptInviteInfo = async (token: string) => {
  return get<undefined, ApiResponse<AcceptInviteInfoResponseData>>(
    `/api/auth/accept-invite?token=${encodeURIComponent(token)}`,
    false
  );
};

export const postAcceptInvite = async (payload: AcceptInvitePayload) => {
  return post<AcceptInvitePayload, ApiResponse<AcceptInviteResponseData>>(
    '/api/auth/accept-invite',
    false,
    payload
  );
};

export const getSetPasswordInfo = async (token: string) => {
  return get<undefined, ApiResponse<SetPasswordInfoResponseData>>(
    `/api/auth/set-password?token=${encodeURIComponent(token)}`,
    false
  );
};

export const postSetPasswordAfterApproval = async (
  payload: SetPasswordAfterApprovalPayload
) => {
  return post<
    SetPasswordAfterApprovalPayload,
    ApiResponse<SetPasswordAfterApprovalResponseData>
  >('/api/auth/set-password-after-approval', false, payload);
};
