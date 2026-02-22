/**
 * Dev seed: ensures default organization exists and a platform-admin user (OWNER of default org)
 * so you can log in and use the Admin panel to approve org requests locally.
 * Run from server dir: npm run seed:dev
 *
 * After running, set PLATFORM_ADMIN_ORG_ID=<printed id> in .env, then log in as the dev admin
 * and select the default org to see Admin in the sidebar.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { MONGODB_URL } from '../config/env.js';
import ORGANIZATION from '../models/organization.model.js';
import ORGANIZATION_MEMBER from '../models/organization-member.model.js';
import SUBSCRIBER from '../models/subscriber.model.js';
import USER from '../models/user.model.js';
import { FEATURE_LIST } from '../constants/rbac.js';
import { ORG_MEMBER_ROLES } from '../constants/rbac.js';
import { SALT_ROUNDS } from '../constants/index.js';
import { USER_ROLES } from '../typings/index.js';
import { generateUsername } from '../controllers/auth/utils/index.js';

const DEFAULT_ORG_SLUG = 'default';
const DEFAULT_ORG_NAME = 'Default';

const DEV_ADMIN_EMAIL = 'dev@localhost';
const DEV_ADMIN_PASSWORD = 'DevAdmin123';
const DEV_ADMIN_FULLNAME = 'Dev Admin';

async function seedDev() {
  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  try {
    let org = await ORGANIZATION.findOne({ slug: DEFAULT_ORG_SLUG }).lean();
    if (!org) {
      const created = await ORGANIZATION.create({
        name: DEFAULT_ORG_NAME,
        slug: DEFAULT_ORG_SLUG,
        status: 'active',
        enabled_features: [...FEATURE_LIST],
      });
      org = created.toObject();
      console.log(
        `Created default organization: ${DEFAULT_ORG_NAME} (${DEFAULT_ORG_SLUG})`
      );
    } else {
      console.log(
        `Default organization already exists: ${org.name} (${org.slug})`
      );
    }

    const orgId = org._id;

    let subscriber = await SUBSCRIBER.findOne({
      email: DEV_ADMIN_EMAIL,
    }).lean();
    if (!subscriber) {
      const created = await SUBSCRIBER.create({
        email: DEV_ADMIN_EMAIL,
        is_subscribed: true,
        subscribed_at: new Date(),
      });
      const sub = Array.isArray(created) ? created[0] : created;
      subscriber = sub?.toObject ? sub.toObject() : sub;
      console.log(`Created subscriber: ${DEV_ADMIN_EMAIL}`);
    }

    let user = await USER.findOne({
      'personal_info.subscriber_id': subscriber._id,
    }).lean();
    if (!user) {
      const username = await generateUsername(DEV_ADMIN_EMAIL);
      const hashedPassword = await bcrypt.hash(DEV_ADMIN_PASSWORD, SALT_ROUNDS);
      const created = await USER.create({
        personal_info: {
          fullname: DEV_ADMIN_FULLNAME,
          subscriber_id: subscriber._id,
          password: hashedPassword,
          username,
        },
        role: USER_ROLES.USER,
      });
      const u = Array.isArray(created) ? created[0] : created;
      user = u?.toObject ? u.toObject() : u;
      console.log(`Created dev admin user: ${DEV_ADMIN_EMAIL}`);
    }

    const existingMember = await ORGANIZATION_MEMBER.findOne({
      user_id: user._id,
      org_id: orgId,
    }).lean();
    if (!existingMember) {
      await ORGANIZATION_MEMBER.create({
        user_id: user._id,
        org_id: orgId,
        role: ORG_MEMBER_ROLES.OWNER,
      });
      console.log(
        `Added dev admin as OWNER of default org (can access Admin panel when PLATFORM_ADMIN_ORG_ID is set)`
      );
    }

    console.log('\n---');
    console.log('Set in your .env (server):');
    console.log(`  PLATFORM_ADMIN_ORG_ID=${orgId}`);
    console.log('\nThen log in with:');
    console.log(`  Email: ${DEV_ADMIN_EMAIL}`);
    console.log(`  Password: ${DEV_ADMIN_PASSWORD}`);
    console.log('Select the "Default" org to see Admin in the sidebar.');
    console.log('---\n');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seedDev();
