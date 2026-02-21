import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import USER from '../../../models/user.model.js';
import {
  JWT_SECRET_ACCESS_KEY,
  JWT_SECRET_REFRESH_KEY,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from '../../../config/env.js';
import { TOKEN_TYPE } from '../../../typings/index.js';

/**
 * Generate a unique username from email
 * @param {string} email - User's email address
 * @returns {Promise<string>} - Unique username
 */
export const generateUsername = async email => {
  let username = email.split('@')[0];
  const isUsernameNotUnique = await USER.exists({
    'personal_info.username': username,
  });
  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

/**
 * Generate pre-org access and refresh tokens (used at login).
 * Pre-org tokens do not contain org_id; used only for select-org and refresh.
 * Payload: user_id, subscriber_id, optional email, token_type: 'pre_org'.
 */
export const generatePreOrgToken = payload => {
  const preOrgPayload = {
    ...payload,
    token_type: TOKEN_TYPE.PRE_ORG,
  };
  const access_token = jwt.sign(preOrgPayload, JWT_SECRET_ACCESS_KEY, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
  const refresh_token = jwt.sign(preOrgPayload, JWT_SECRET_REFRESH_KEY, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
  return { access_token, refresh_token };
};

/**
 * Generate org-scoped access token only (used after select-org).
 * No refresh token; client re-selects org or refreshes (gets pre-org) when access expires.
 * Payload: user_id, org_id, subscriber_id, email, role, permissions[], org_features[], token_type: 'org_scoped'.
 */
export const generateOrgScopedToken = payload => {
  const orgScopedPayload = {
    ...payload,
    token_type: TOKEN_TYPE.ORG_SCOPED,
  };
  const access_token = jwt.sign(orgScopedPayload, JWT_SECRET_ACCESS_KEY, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
  return { access_token };
};

/**
 * Generate access and refresh JWT tokens (legacy / refresh flow: issues pre-org tokens).
 * @param {Object} payload - Must include user_id, subscriber_id; token_type set to pre_org.
 * @returns {Object} - Object containing access_token and refresh_token
 */
export const generateTokens = payload => {
  const withType = { ...payload, token_type: TOKEN_TYPE.PRE_ORG };
  const access_token = jwt.sign(withType, JWT_SECRET_ACCESS_KEY, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
  const refresh_token = jwt.sign(withType, JWT_SECRET_REFRESH_KEY, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
  return { access_token, refresh_token };
};
