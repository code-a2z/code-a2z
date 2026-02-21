import { model } from 'mongoose';
import ORGANIZATION_MEMBER_SCHEMA from '../schemas/organization-member.schema.js';
import { COLLECTION_NAMES } from '../constants/db.js';

const ORGANIZATION_MEMBER = model(
  COLLECTION_NAMES.ORGANIZATION_MEMBERS,
  ORGANIZATION_MEMBER_SCHEMA
);

export default ORGANIZATION_MEMBER;
