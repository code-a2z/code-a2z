import { Schema } from 'mongoose';
import {
  profile_imgs_collections_list,
  profile_imgs_name_list,
} from '../constants/index.js';
import { COLLECTION_NAMES } from '../constants/db.js';
import { USER_ROLES } from '../typings/index.js';

const USER_SCHEMA = Schema(
  {
    personal_info: {
      fullname: {
        type: String,
        lowercase: true,
        required: true,
        minlength: [3, 'Fullname must be 3 letters long'],
      },
      subscriber_id: {
        type: Schema.Types.ObjectId,
        ref: COLLECTION_NAMES.SUBSCRIBERS,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: [6, 'Password must be 6 letters long'],
      },
      username: {
        type: String,
        minlength: [3, 'Username must be 3 letters long'],
        unique: true,
        lowercase: true,
        required: true,
      },
      bio: {
        type: String,
        maxlength: [200, 'Bio should not be more than 200'],
        default: '',
      },
      profile_img: {
        type: String,
        default: () => {
          return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`;
        },
      },
      resetToken: {
        type: String,
        default: null,
      },
      resetTokenExpiry: {
        type: Date,
        default: null,
      },
    },
    social_links: {
      youtube: {
        type: String,
        default: '',
      },
      instagram: {
        type: String,
        default: '',
      },
      facebook: {
        type: String,
        default: '',
      },
      x: {
        // Twitter
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
      linkedin: {
        type: String,
        default: '',
      },
      website: {
        type: String,
        default: '',
      },
    },
    account_info: {
      total_posts: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      required: true,
    },
    project_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.PROJECTS,
      default: [],
    },
    collaborated_project_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.PROJECTS,
      default: [],
    },
    collection_ids: {
      type: [Schema.Types.ObjectId],
      ref: COLLECTION_NAMES.COLLECTIONS,
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: 'joinedAt',
    },
  }
);

export default USER_SCHEMA;
