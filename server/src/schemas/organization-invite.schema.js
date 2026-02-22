import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db.js';
import { ORG_MEMBER_ROLE_LIST } from '../constants/rbac.js';

const INVITE_STATUS = ['pending', 'accepted', 'expired'];

const ORGANIZATION_INVITE_SCHEMA = Schema(
  {
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
    role: {
      type: String,
      required: true,
      enum: {
        values: ORG_MEMBER_ROLE_LIST,
        message: `role must be one of: ${ORG_MEMBER_ROLE_LIST.join(', ')}`,
      },
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USERS,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: INVITE_STATUS,
        message: `status must be one of: ${INVITE_STATUS.join(', ')}`,
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One pending invite per email per org (allow re-invite after expiry/accept)
ORGANIZATION_INVITE_SCHEMA.index(
  { email: 1, org_id: 1, status: 1 },
  { partialFilterExpression: { status: 'pending' } }
);

export default ORGANIZATION_INVITE_SCHEMA;
