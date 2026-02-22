import { Schema } from 'mongoose';
import { FEATURE_LIST } from '../constants/rbac.js';

const ORGANIZATION_STATUS = ['pending', 'active', 'rejected'];

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
    status: {
      type: String,
      enum: {
        values: ORGANIZATION_STATUS,
        message: `status must be one of: ${ORGANIZATION_STATUS.join(', ')}`,
      },
      default: 'pending',
    },
    requested_by_email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    requested_by_name: {
      type: String,
      trim: true,
    },
    enabled_features: {
      type: [
        {
          type: String,
          enum: {
            values: FEATURE_LIST,
            message: 'Invalid feature in enabled_features',
          },
        },
      ],
      default: () => [...FEATURE_LIST],
    },
  },
  {
    timestamps: true,
  }
);

ORGANIZATION_SCHEMA.index({ status: 1 });
ORGANIZATION_SCHEMA.index(
  { requested_by_email: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

export default ORGANIZATION_SCHEMA;
export { ORGANIZATION_STATUS };
