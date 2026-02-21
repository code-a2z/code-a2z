import { model } from 'mongoose';
import ORGANIZATION_SCHEMA from '../schemas/organization.schema.js';
import { COLLECTION_NAMES } from '../constants/db.js';

const ORGANIZATION = model(COLLECTION_NAMES.ORGANIZATIONS, ORGANIZATION_SCHEMA);

export default ORGANIZATION;
