/**
 * CLI: List pending organization invites and print accept-invite links.
 * Use this to share links with contributors so they can accept their invite
 * (set password and join the org). Run from server dir.
 *
 * Usage:
 *   node src/db/list-invite-links.js [--org-id=<id>] [--extend]
 *
 * Env: MONGODB_URL, VITE_CLIENT_DOMAIN (base URL for links, e.g. https://your-app.vercel.app)
 *
 * --org-id   Optional. Only list invites for this organization.
 * --extend   Extend expired pending invites by 7 days so they can accept.
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGODB_URL, VITE_CLIENT_DOMAIN } from '../config/env.js';
import ORGANIZATION_INVITE from '../models/organization-invite.model.js';

const INVITE_EXPIRY_DAYS = 7;

function printUsage() {
  console.log(`
Usage:
  node src/db/list-invite-links.js [--org-id=<id>] [--extend]

Env: MONGODB_URL, VITE_CLIENT_DOMAIN (for accept-invite link base URL)

Options:
  --org-id=<id>  Only list invites for this organization (default: all orgs).
  --extend       Extend expired pending invites by 7 days so they become valid again.

Example:
  MONGODB_URL="mongodb+srv://..." VITE_CLIENT_DOMAIN="https://your-app.vercel.app" \\
  node src/db/list-invite-links.js --org-id=507f1f77bcf86cd799439011
`);
}

async function main() {
  const args = process.argv.slice(2);
  let orgId = null;
  let extend = false;

  for (const arg of args) {
    if (arg.startsWith('--org-id=')) {
      orgId = arg.slice(9).trim();
    } else if (arg === '--extend') {
      extend = true;
    }
  }

  if (!VITE_CLIENT_DOMAIN) {
    console.error('VITE_CLIENT_DOMAIN is required for generating links.');
    printUsage();
    process.exit(1);
  }

  const baseUrl = VITE_CLIENT_DOMAIN.replace(/\/$/, '');
  const acceptInvitePath = '/accept-invite';

  try {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  try {
    if (extend) {
      const expired = await ORGANIZATION_INVITE.find({
        status: 'pending',
        expires_at: { $lt: new Date() },
        ...(orgId ? { org_id: orgId } : {}),
      });
      const extendTo = new Date();
      extendTo.setDate(extendTo.getDate() + INVITE_EXPIRY_DAYS);
      let updated = 0;
      for (const inv of expired) {
        await ORGANIZATION_INVITE.updateOne(
          { _id: inv._id },
          { $set: { expires_at: extendTo } }
        );
        updated++;
        console.log(`Extended invite for ${inv.email} (role: ${inv.role})`);
      }
      if (updated > 0) {
        console.log(
          `\nExtended ${updated} expired invite(s). Valid for ${INVITE_EXPIRY_DAYS} days.\n`
        );
      }
    }

    const query = {
      status: 'pending',
      expires_at: { $gt: new Date() },
      ...(orgId ? { org_id: orgId } : {}),
    };

    const invites = await ORGANIZATION_INVITE.find(query)
      .select('email role token expires_at org_id')
      .sort({ org_id: 1, createdAt: -1 })
      .lean();

    if (invites.length === 0) {
      console.log(
        orgId
          ? 'No valid pending invites for this organization.'
          : 'No valid pending invites found.'
      );
      console.log('Use --extend to extend expired pending invites by 7 days.');
      return;
    }

    console.log(
      `\nPending invites (${invites.length}) – share each link with the invitee:\n`
    );
    for (const inv of invites) {
      const link = `${baseUrl}${acceptInvitePath}?token=${inv.token}`;
      console.log(`${inv.email} (${inv.role})`);
      console.log(`  ${link}`);
      console.log(`  Expires: ${inv.expires_at.toISOString()}\n`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
