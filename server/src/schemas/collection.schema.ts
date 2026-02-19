import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db';

const COLLECTION_SCHEMA = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
    },
    collection_name: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description should not be more than 200 characters'],
      default: '',
    },
    project_ids: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: COLLECTION_NAMES.PROJECTS,
    },
  },
  {
    timestamps: true,
  }
);

export default COLLECTION_SCHEMA;
