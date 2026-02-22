export interface signUpPayload {
  fullname: string;
  email: string;
  password: string;
}

export interface loginPayload {
  email: string;
  password: string;
}

export interface changePasswordPayload {
  current_password: string;
  new_password: string;
}

/** Limited user returned by login, signup, and select-org. */
export interface AuthUser {
  id: string;
  fullname?: string;
  username?: string;
  email?: string;
  profile_img?: string;
}

/** Org list item returned by login (user's memberships). */
export interface LoginOrgItem {
  org_id: string;
  name: string;
  role: string;
}

export interface LoginSignupResponseData {
  user: AuthUser;
  orgs: LoginOrgItem[];
  access_token: string;
}

export interface selectOrgPayload {
  org_id: string;
}

export interface SelectOrgResponseData {
  access_token: string;
  user: AuthUser;
  role: string;
  permissions: string[];
  org_features: string[];
  org: { org_id: string; name: string; slug: string };
}

/** GET accept-invite response (org name for valid token). */
export interface AcceptInviteInfoResponseData {
  org_name: string;
}

/** POST accept-invite payload. */
export interface AcceptInvitePayload {
  token: string;
  password: string;
  fullname: string;
}

/** POST accept-invite response (same as login: user, orgs, access_token). */
export interface AcceptInviteResponseData {
  user: AuthUser;
  orgs: LoginOrgItem[];
  access_token: string;
}

/** GET set-password response (org name for valid token). */
export interface SetPasswordInfoResponseData {
  org_name: string;
}

/** POST set-password-after-approval payload. */
export interface SetPasswordAfterApprovalPayload {
  token: string;
  password: string;
  fullname?: string;
}

/** POST set-password-after-approval response (same as login). */
export interface SetPasswordAfterApprovalResponseData {
  user: AuthUser;
  orgs: LoginOrgItem[];
  access_token: string;
}
