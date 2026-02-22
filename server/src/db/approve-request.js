/**
 * CLI: Approve a pending organization request (for local dev / "approve from outside").
 * Usage:
 *   node src/db/approve-request.js <orgId>
 *   node src/db/approve-request.js --email=requester@example.com
 * Run from server dir. Uses MONGODB_URL from .env. Does not send email; logs set-password link if requester has no account.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGODB_URL } from '../config/env.js';
import ORGANIZATION from '../models/organization.model.js';
import { approveOrganizationCore } from '../services/approve-organization.js';

function printUsage() {
  console.log(`
Usage:
  node src/db/approve-request.js <orgId>
  node src/db/approve-request.js --email=requester@example.com

Examples:
  node src/db/approve-request.js 507f1f77bcf86cd799439011
  node src/db/approve-request.js --email=you@example.com
`);
}

async function main() {
  const args = process.argv.slice(2);
  let orgId = null;
  let email = null;

  for (const arg of args) {
    if (arg.startsWith('--email=')) {
      email = arg.slice(8).trim().toLowerCase();
    } else if (arg && !arg.startsWith('--')) {
      orgId = arg;
    }
  }

  if (!orgId && !email) {
    printUsage();
    process.exit(1);
  }

  if (orgId && email) {
    console.error('Provide either orgId or --email, not both.');
    printUsage();
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  if (email) {
    try {
      const org = await ORGANIZATION.findOne({
        status: 'pending',
        requested_by_email: email,
      })
        .select('_id')
        .lean();
      if (!org) {
        console.error(
          `No pending organization request found for email: ${email}`
        );
        process.exit(1);
      }
      orgId = String(org._id);
    } catch (err) {
      console.error('Lookup failed:', err.message);
      process.exit(1);
    }
  }

  try {
    const result = await approveOrganizationCore(orgId);

    if (!result.success) {
      console.error(result.message);
      process.exit(1);
    }

    console.log(result.message);

    if (result.setPasswordLink) {
      console.log(
        '\nSet-password link (share with requester; no email sent by this script):'
      );
      console.log(result.setPasswordLink);
    }
  } catch (err) {
    console.error('Approve failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
