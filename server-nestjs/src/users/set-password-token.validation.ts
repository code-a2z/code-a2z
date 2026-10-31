import {
  readDate,
  readObjectId,
  readRecord,
  readString,
} from '../database/document-validation.js';
import type {
  CreateSetPasswordTokenInput,
  SetPasswordToken,
} from './types/set-password-token.js';

export function prepareSetPasswordToken(
  input: CreateSetPasswordTokenInput,
  now: Date = new Date(),
): SetPasswordToken {
  const token = readRecord(input, 'set_password_token');

  return {
    token: readString(token.token, 'token'),
    email: readString(token.email, 'email', {
      lowercase: true,
      trim: true,
    }),
    org_id: readObjectId(token.org_id, 'org_id'),
    expires_at: readDate(token.expires_at, 'expires_at'),
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}
