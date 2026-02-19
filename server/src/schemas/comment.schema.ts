import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db';

const COMMENT_SCHEMA = new Schema(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.PROJECTS,
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment should not be more than 1000 characters'],
    },
    children_comment_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.COMMENTS,
    },
    user_id: {
      // The user who made the comment
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
    },
    is_reply: {
      type: Boolean,
      default: false,
    },
    parent_comment_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.COMMENTS,
    },
  },
  {
    timestamps: true,
  }
);

export default COMMENT_SCHEMA;
