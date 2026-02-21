/**
 * One-time seed: ensure a default organization exists and all existing users
 * are members (so current users keep access after multi-org rollout).
 * Run from server dir: npm run seed:default-org
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGODB_URL } from '../config/env.js';
import ORGANIZATION from '../models/organization.model.js';
import ORGANIZATION_MEMBER from '../models/organization-member.model.js';
import USER from '../models/user.model.js';
import { FEATURE_LIST, ORG_MEMBER_ROLES } from '../constants/rbac.js';

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
    let org = await ORGANIZATION.findOne({ slug: DEFAULT_ORG_SLUG });
    if (!org) {
      org = await ORGANIZATION.create({
        name: DEFAULT_ORG_NAME,
        slug: DEFAULT_ORG_SLUG,
        enabled_features: [...FEATURE_LIST],
      });
      console.log(`Created default organization: ${org.name} (${org.slug})`);
    } else {
      console.log(
        `Default organization already exists: ${org.name} (${org.slug})`
      );
    }

    const users = await USER.find({}).select('_id').lean();
    let added = 0;
    for (const u of users) {
      const exists = await ORGANIZATION_MEMBER.findOne({
        user_id: u._id,
        org_id: org._id,
      });
      if (!exists) {
        await ORGANIZATION_MEMBER.create({
          user_id: u._id,
          org_id: org._id,
          role: ORG_MEMBER_ROLES.MEMBER,
        });
        added++;
      }
    }
    console.log(
      `Ensured org membership: ${added} new member(s), ${users.length} total user(s).`
    );
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seedDefaultOrg();
