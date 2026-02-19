import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db';

const PROJECT_SCHEMA = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    banner_url: {
      type: String,
      default:
        'https://res.cloudinary.com/avdhesh-varshney/image/upload/v1741270498/project_banner_wpphwm.png',
    },
    description: {
      type: String,
      maxlength: [200, 'Bio should not be more than 200'],
    },
    repository_url: {
      type: String,
      required: true,
      unique: true,
    },
    live_url: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      lowercase: true,
      required: true,
    },
    content_blocks: {
      type: [],
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTION_NAMES.USERS,
    },
    activity: {
      total_likes: {
        type: Number,
        default: 0,
      },
      total_comments: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
      total_parent_comments: {
        type: Number,
        default: 0,
      },
    },
    is_draft: {
      type: Boolean,
      default: false, // false means published
    },
    comment_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.COMMENTS,
    },
    collaborator_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.USERS,
    },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  }
);

export default PROJECT_SCHEMA;
