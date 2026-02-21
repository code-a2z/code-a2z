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
import ORGANIZATION from '../models/organization.model.js';
import ORGANIZATION_MEMBER from '../models/organization-member.model.js';
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
}

async function cleanupTestData() {
  await PROJECT.deleteMany({ org_id: defaultOrgId });
  await COLLECTION.deleteMany({ org_id: defaultOrgId });
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
  });

  describe('3. Auth: signup and refresh', () => {
    it('POST /api/auth/signup with valid body returns 201', async () => {
      const email = `signup-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          fullname: 'Signup Test',
          email,
          password: 'Test123',
        })
        .expect(201);
      assert.strictEqual(res.body.status, 'success');
      assert.ok(res.body.data.access_token);
      assert.ok(res.body.data.user);
      assert.deepStrictEqual(res.body.data.orgs, []);
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
});
