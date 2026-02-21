import { Schema } from 'mongoose';
import { COLLECTION_NAMES } from '../constants/db.js';
import { ORG_MEMBER_ROLE_LIST } from '../constants/rbac.js';

const ORGANIZATION_MEMBER_SCHEMA = Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USERS,
      required: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

// One membership per user per org (prevents duplicate joins and auth loopholes)
ORGANIZATION_MEMBER_SCHEMA.index({ user_id: 1, org_id: 1 }, { unique: true });
// List members of an org
ORGANIZATION_MEMBER_SCHEMA.index({ org_id: 1 });

export default ORGANIZATION_MEMBER_SCHEMA;
