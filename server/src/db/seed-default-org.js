/**
 * Optional seed: create the default organization if it does not exist.
 * Does not attach any users (no OrganizationMember rows). Run from server dir: npm run seed:default-org
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGODB_URL } from '../config/env.js';
import ORGANIZATION from '../models/organization.model.js';
import { FEATURE_LIST } from '../constants/rbac.js';

const DEFAULT_ORG_SLUG = 'default';
const DEFAULT_ORG_NAME = 'Default';

async function seedDefaultOrg() {
  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  try {
    const existing = await ORGANIZATION.findOne({ slug: DEFAULT_ORG_SLUG });
    if (existing) {
      console.log(
        `Default organization already exists: ${existing.name} (${existing.slug})`
      );
    } else {
      await ORGANIZATION.create({
        name: DEFAULT_ORG_NAME,
        slug: DEFAULT_ORG_SLUG,
        status: 'active',
        enabled_features: [...FEATURE_LIST],
      });
      console.log(
        `Created default organization: ${DEFAULT_ORG_NAME} (${DEFAULT_ORG_SLUG})`
      );
    }
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seedDefaultOrg();
