import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import USER from '../../../models/user.model.js';
import {
  JWT_SECRET_ACCESS_KEY,
  JWT_SECRET_REFRESH_KEY,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from '../../../config/env.js';

/**
 * Generate a unique username from email
 * @param {string} email - User's email address
 * @returns {Promise<string>} - Unique username
 */
export const generateUsername = async (email: string): Promise<string> => {
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
 * Generate access and refresh JWT tokens
 * @param {Object} payload - JWT payload data
 * @returns {Object} - Object containing access_token and refresh_token
 */
export const generateTokens = (
  payload: any
): { access_token: string; refresh_token: string } => {
  const access_token = jwt.sign(payload, JWT_SECRET_ACCESS_KEY, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
  const refresh_token = jwt.sign(payload, JWT_SECRET_REFRESH_KEY, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
  return { access_token, refresh_token };
};
