import { model } from 'mongoose';
import ORGANIZATION_INVITE_SCHEMA from '../schemas/organization-invite.schema.js';
import { COLLECTION_NAMES } from '../constants/db.js';

const ORGANIZATION_INVITE = model(
  COLLECTION_NAMES.ORGANIZATION_INVITES,
  ORGANIZATION_INVITE_SCHEMA
);

export default ORGANIZATION_INVITE;
