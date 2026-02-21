/**
 * API test suite: auth flow (no token → login → select-org → org-scoped) then in-org routes.
 * Uses MONGODB_URL (e.g. code_a2z_test). Seeds minimal data in before().
 * Run: npm test (in server/) — uses Node's test runner for ESM compatibility.
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcrypt';

import app from '../app.js';
import { MONGODB_URL } from '../config/env.js';
import { nanoid } from 'nanoid';
import ORGANIZATION from '../models/organization.model.js';
import ORGANIZATION_MEMBER from '../models/organization-member.model.js';
import ORGANIZATION_INVITE from '../models/organization-invite.model.js';
import USER from '../models/user.model.js';
import SUBSCRIBER from '../models/subscriber.model.js';
import PROJECT from '../models/project.model.js';
import COLLECTION from '../models/collection.model.js';
import { FEATURE_LIST, ORG_MEMBER_ROLES } from '../constants/rbac.js';
import { SALT_ROUNDS } from '../constants/index.js';

const TEST_EMAIL = 'api-test@example.com';
const TEST_PASSWORD = 'Test123';
const DEFAULT_ORG_SLUG = 'default';

let defaultOrgId;
let testUserId;
let preOrgToken;
let orgScopedToken;
let createdProjectId;

async function seedTestData() {
  let org = await ORGANIZATION.findOne({ slug: DEFAULT_ORG_SLUG });
  if (!org) {
    org = await ORGANIZATION.create({
      name: 'Default',
      slug: DEFAULT_ORG_SLUG,
      enabled_features: [...FEATURE_LIST],
    });
  }
  defaultOrgId = org._id;

  let subscriber = await SUBSCRIBER.findOne({ email: TEST_EMAIL });
  if (!subscriber) {
    subscriber = await SUBSCRIBER.create({
      email: TEST_EMAIL,
      is_subscribed: true,
      subscribed_at: new Date(),
    });
  }

  let user = await USER.findOne({
    'personal_info.subscriber_id': subscriber._id,
  });
  if (!user) {
    const hashed = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
    const username = 'apitest' + Date.now().toString(36);
    user = await USER.create({
      personal_info: {
        fullname: 'API Test User',
        subscriber_id: subscriber._id,
        password: hashed,
        username,
      },
    });
  }
  let member = await ORGANIZATION_MEMBER.findOne({
    user_id: user._id,
    org_id: defaultOrgId,
  });
  if (!member) {
    await ORGANIZATION_MEMBER.create({
      user_id: user._id,
      org_id: defaultOrgId,
      role: ORG_MEMBER_ROLES.ADMIN,
    });
  }
  testUserId = user._id;
}

async function cleanupTestData() {
  await PROJECT.deleteMany({ org_id: defaultOrgId });
  await COLLECTION.deleteMany({ org_id: defaultOrgId });
  await ORGANIZATION_INVITE.deleteMany({ org_id: defaultOrgId });
}

describe('API suite (auth order then in-org)', () => {
  before(async () => {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    await seedTestData();
  });

  after(async () => {
    await cleanupTestData();
    await mongoose.disconnect();
  });

  describe('1. No token: in-org routes return 401', () => {
    it('GET /api/project without token returns 401', async () => {
      const res = await request(app).get('/api/project').expect(401);
      assert.strictEqual(res.body.status, 'error');
      assert.match(res.body.message, /access token|No access token/i);
    });

    it('GET /api/notification without token returns 401', async () => {
      const res = await request(app).get('/api/notification').expect(401);
      assert.strictEqual(res.body.status, 'error');
    });
  });

  describe('2. Auth: login returns pre-org token + user + orgs', () => {
    it('POST /api/auth/login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data);
      assert.ok(res.body.data.access_token);
      assert.ok(res.body.data.user);
      assert.ok(res.body.data.orgs);
      assert.strictEqual(Array.isArray(res.body.data.orgs), true);
      preOrgToken = res.body.data.access_token;
    });

    it('POST /api/auth/login with wrong password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPass1' })
        .expect(401);
      assert.strictEqual(res.body.status, 'error');
    });

    it('POST /api/auth/login when user has no org returns 403, no token', async () => {
      const noOrgEmail = `no-org-${Date.now()}@example.com`;
      const sub = await SUBSCRIBER.create({
        email: noOrgEmail,
        is_subscribed: true,
        subscribed_at: new Date(),
      });
      const hashed = await bcrypt.hash('Test123', SALT_ROUNDS);
      const u = await USER.create({
        personal_info: {
          fullname: 'No Org User',
          subscriber_id: sub._id,
          password: hashed,
          username: 'noorg' + Date.now().toString(36),
        },
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: noOrgEmail, password: 'Test123' })
        .expect(403);
      assert.strictEqual(res.body.status, 'error');
      assert.ok(
        res.body.message
          ?.toLowerCase()
          .includes('not a member of any organization'),
        'Message must contain "not a member of any organization"'
      );
      assert.ok(!res.body.data?.access_token);
      assert.strictEqual(res.headers['set-cookie'], undefined);
      await USER.deleteOne({ _id: u._id });
      await SUBSCRIBER.deleteOne({ _id: sub._id });
    });
  });

  describe('3. Auth: signup disabled (invite-only) and refresh', () => {
    it('POST /api/auth/signup returns 403 (signup disabled)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          fullname: 'Signup Test',
          email: `signup-${Date.now()}@example.com`,
          password: 'Test123',
        })
        .expect(403);
      assert.strictEqual(res.body.status, 'error');
      assert.ok(
        res.body.message?.toLowerCase().includes('signup is disabled'),
        'Message must contain "Signup is disabled"'
      );
      assert.ok(!res.body.data?.access_token);
    });

    it('POST /api/auth/refresh with cookie returns pre-org token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const cookie = loginRes.headers['set-cookie'];
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .expect(200);
      assert.ok(res.body.data.access_token);
    });
  });

  describe('4. Select-org: pre-org token + org_id returns org-scoped token', () => {
    it('POST /api/auth/select-org with pre-org token and org_id', async () => {
      const res = await request(app)
        .post('/api/auth/select-org')
        .set('Authorization', `Bearer ${preOrgToken}`)
        .send({ org_id: defaultOrgId.toString() })
        .expect(200);
      assert.ok(res.body.data.access_token);
      assert.ok(res.body.data.org);
      assert.ok(res.body.data.role);
      orgScopedToken = res.body.data.access_token;
    });

    it('Pre-org token must not work for in-org: GET /api/project returns 403', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${preOrgToken}`)
        .expect(403);
      assert.match(res.body.message, /Organization context|select-org/i);
    });
  });

  describe('5. In-org: projects (org-scoped token)', () => {
    it('GET /api/project with org-scoped token returns 200', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
      assert.strictEqual(Array.isArray(res.body.data), true);
    });

    it('POST /api/project with org-scoped token creates project', async () => {
      const res = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({
          title: 'Test Project',
          repository_url: `https://github.com/test/repo-${Date.now()}`,
          tags: ['test'],
          content_blocks: [],
          is_draft: true,
        })
        .expect(200);
      assert.ok(res.body.data.id);
      createdProjectId = res.body.data.id;
    });
  });

  describe('5b. In-org: organization members and invite', () => {
    it('GET /api/organization/members with org-scoped token returns 200 and list', async () => {
      const res = await request(app)
        .get('/api/organization/members')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(Array.isArray(res.body.data?.members));
      assert.ok(Array.isArray(res.body.data?.pending_invites));
    });

    it('GET /api/organization/members without token returns 401', async () => {
      await request(app).get('/api/organization/members').expect(401);
    });

    it('POST /api/organization/invite with org-scoped token creates invite', async () => {
      const inviteEmail = `invite-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/organization/invite')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({ email: inviteEmail, role: 'member' })
        .expect(201);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data?.invite_id);
      assert.strictEqual(res.body.data?.email, inviteEmail);
      assert.strictEqual(res.body.data?.role, 'member');
      assert.ok(res.body.data?.expires_at);
    });

    it('POST /api/organization/invite without token returns 401', async () => {
      await request(app)
        .post('/api/organization/invite')
        .send({ email: 'a@b.com', role: 'member' })
        .expect(401);
    });

    it('POST /api/organization/invite with invalid body returns 400', async () => {
      const res = await request(app)
        .post('/api/organization/invite')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({ role: 'member' })
        .expect(400);
      assert.strictEqual(res.body.status, 'error');
    });
  });

  describe('6. In-org: collections (org-scoped token)', () => {
    let createdCollectionId;

    it('POST /api/collection creates collection', async () => {
      const name = `test-collection-${Date.now()}`;
      const res = await request(app)
        .post('/api/collection')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({ collection_name: name, description: 'Test' })
        .expect(201);
      assert.strictEqual(res.body.status, 'success');
      createdCollectionId = res.body.data?._id ?? res.body.data?.id;
      if (res.body.data && !createdCollectionId)
        createdCollectionId = res.body.data._id || res.body.data.id;
    });

    it('GET /api/collection/sort-projects with collection_id returns 200', async () => {
      if (!createdCollectionId) return;
      const res = await request(app)
        .get('/api/collection/sort-projects')
        .query({ collection_id: createdCollectionId })
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });
  });

  describe('7. In-org: notifications (org-scoped token)', () => {
    it('GET /api/notification returns 200', async () => {
      const res = await request(app)
        .get('/api/notification')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });

    it('GET /api/notification/count returns 200', async () => {
      const res = await request(app)
        .get('/api/notification/count')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });
  });

  describe('8. In-org: chat (org-scoped token)', () => {
    it('GET /api/chat/conversations returns 200', async () => {
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });

    it('GET /api/chat/online-users returns 200', async () => {
      const res = await request(app)
        .get('/api/chat/online-users')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });
  });

  describe('9. In-org: collaboration (org-scoped token)', () => {
    it('GET /api/collaboration/:project_id returns 200', async () => {
      if (!createdProjectId) return;
      const res = await request(app)
        .get(`/api/collaboration/${createdProjectId}`)
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });
  });

  describe('10. In-org: feedback (org-scoped token)', () => {
    it('POST /api/feedback/submit returns 201', async () => {
      const res = await request(app)
        .post('/api/feedback/submit')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({
          title: 'Test feedback title here',
          details: 'Detailed description with at least ten characters.',
          category: 'articles',
        })
        .expect(201);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data.feedback);
    });

    it('GET /api/feedback/user returns 200', async () => {
      const res = await request(app)
        .get('/api/feedback/user')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
    });
  });

  describe('11. Auth: accept-invite (public)', () => {
    it('GET /api/auth/accept-invite without token returns 400', async () => {
      const res = await request(app).get('/api/auth/accept-invite').expect(400);
      assert.strictEqual(res.body.status, 'error');
    });

    it('GET /api/auth/accept-invite with invalid token returns 404', async () => {
      const res = await request(app)
        .get('/api/auth/accept-invite')
        .query({ token: 'invalid-token-xyz' })
        .expect(404);
      assert.strictEqual(res.body.status, 'error');
    });

    it('GET /api/auth/accept-invite with valid token returns 200 and org_name', async () => {
      const token = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await ORGANIZATION_INVITE.create({
        email: `accept-get-${Date.now()}@example.com`,
        org_id: defaultOrgId,
        role: 'member',
        token,
        expires_at: expiresAt,
        created_by: testUserId,
        status: 'pending',
      });
      const res = await request(app)
        .get('/api/auth/accept-invite')
        .query({ token })
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data?.org_name);
    });

    it('POST /api/auth/accept-invite with invalid token returns 404', async () => {
      const res = await request(app)
        .post('/api/auth/accept-invite')
        .send({
          token: 'invalid-token-xyz',
          password: 'Test123',
          fullname: 'Test User',
        })
        .expect(404);
      assert.strictEqual(res.body.status, 'error');
    });

    it('POST /api/auth/accept-invite with valid token creates user and returns access_token', async () => {
      const token = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const inviteEmail = `accept-post-${Date.now()}@example.com`;
      await ORGANIZATION_INVITE.create({
        email: inviteEmail,
        org_id: defaultOrgId,
        role: 'viewer',
        token,
        expires_at: expiresAt,
        created_by: testUserId,
        status: 'pending',
      });
      const res = await request(app)
        .post('/api/auth/accept-invite')
        .send({
          token,
          password: 'Test123',
          fullname: 'Accept Test User',
        })
        .expect(200);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data?.access_token);
      assert.ok(res.body.data?.user);
      assert.ok(Array.isArray(res.body.data?.orgs));
      const sub = await SUBSCRIBER.findOne({ email: inviteEmail }).lean();
      assert.ok(sub, 'Subscriber should be created for invited email');
      const newUser = await USER.findOne({
        'personal_info.subscriber_id': sub._id,
      }).lean();
      assert.ok(newUser, 'User should be created for accepted invite');
      const member = await ORGANIZATION_MEMBER.findOne({
        org_id: defaultOrgId,
        user_id: newUser._id,
      }).lean();
      assert.ok(
        member,
        'OrganizationMember should be created for accepted invite'
      );
    });
  });
});
