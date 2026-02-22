import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db.js';
import { NOTIFICATION_TYPES } from '../typings/index.js';

const NOTIFICATION_SCHEMA = Schema(
  {
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    project_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.PROJECTS,
    },
    user_id: {
      // The user who performed the action
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
    },
    author_id: {
      // The user who should receive this notification
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
    },
    org_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.ORGANIZATIONS,
      index: true,
    },
    comment_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.COMMENTS,
    },
    reply_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.COMMENTS,
    },
    replied_on_comment_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.COMMENTS,
    },
  },
  {
    timestamps: true,
  }
);

export default NOTIFICATION_SCHEMA;
