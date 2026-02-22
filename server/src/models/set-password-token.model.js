import { model } from 'mongoose';
import SET_PASSWORD_TOKEN_SCHEMA from '../schemas/set-password-token.schema.js';
import { COLLECTION_NAMES } from '../constants/db.js';

const SET_PASSWORD_TOKEN = model(
  COLLECTION_NAMES.SET_PASSWORD_TOKENS,
  SET_PASSWORD_TOKEN_SCHEMA
);

export default SET_PASSWORD_TOKEN;
