/**
 * One-time migration: set org_id on existing projects, collections, and notifications
 * to the default organization (slug: 'default'). Run after adding org_id to schemas.
 * Ensure default org exists first: npm run seed:default-org
 * Run from server dir: node src/db/migrate-org-id.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGODB_URL } from '../config/env.js';
import ORGANIZATION from '../models/organization.model.js';
import PROJECT from '../models/project.model.js';
import COLLECTION from '../models/collection.model.js';
import NOTIFICATION from '../models/notification.model.js';

const DEFAULT_ORG_SLUG = 'default';

async function migrateOrgId() {
  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  try {
    const defaultOrg = await ORGANIZATION.findOne({
      slug: DEFAULT_ORG_SLUG,
    }).lean();
    if (!defaultOrg) {
      console.error(
        `Default organization (slug: ${DEFAULT_ORG_SLUG}) not found. Run: npm run seed:default-org`
      );
      process.exit(1);
    }
    const defaultOrgId = defaultOrg._id;
    console.log(`Using default org: ${defaultOrg.name} (${defaultOrgId})`);

    const projectsResult = await PROJECT.updateMany(
      { org_id: { $exists: false } },
      { $set: { org_id: defaultOrgId } }
    );
    console.log(`Projects: ${projectsResult.modifiedCount} updated`);

    const collectionsResult = await COLLECTION.updateMany(
      { org_id: { $exists: false } },
      { $set: { org_id: defaultOrgId } }
    );
    console.log(`Collections: ${collectionsResult.modifiedCount} updated`);

    const notificationsResult = await NOTIFICATION.updateMany(
      { org_id: { $exists: false } },
      { $set: { org_id: defaultOrgId } }
    );
    console.log(`Notifications: ${notificationsResult.modifiedCount} updated`);

    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

migrateOrgId();
