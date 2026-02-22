import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db.js';

const SET_PASSWORD_TOKEN_SCHEMA = Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    org_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.ORGANIZATIONS,
      required: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

SET_PASSWORD_TOKEN_SCHEMA.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default SET_PASSWORD_TOKEN_SCHEMA;
