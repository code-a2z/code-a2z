import { Schema } from 'mongoose';
import { FEATURE_LIST } from '../constants/rbac.js';

const ORGANIZATION_SCHEMA = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Organization name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric with optional hyphens',
      ],
    },
    enabled_features: {
      type: [String],
      enum: {
        values: FEATURE_LIST,
        message: 'Invalid feature in enabled_features',
      },
      default: () => [...FEATURE_LIST],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for slug lookups (unique already creates an index)
ORGANIZATION_SCHEMA.index({ slug: 1 });

export default ORGANIZATION_SCHEMA;
