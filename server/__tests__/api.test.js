/**
 * API test suite: auth flow (no token → login → select-org → org-scoped) then in-org routes.
 * Uses MONGODB_URL (e.g. code_a2z_test). Seeds minimal data in beforeAll.
 * Run: npm test (in server/)
 */
import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcrypt';

import app from '../src/app.js';
import { MONGODB_URL } from '../src/config/env.js';
import ORGANIZATION from '../src/models/organization.model.js';
import ORGANIZATION_MEMBER from '../src/models/organization-member.model.js';
import USER from '../src/models/user.model.js';
import SUBSCRIBER from '../src/models/subscriber.model.js';
import PROJECT from '../src/models/project.model.js';
import COLLECTION from '../src/models/collection.model.js';
import { FEATURE_LIST, ORG_MEMBER_ROLES } from '../src/constants/rbac.js';
import { SALT_ROUNDS } from '../src/constants/index.js';

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
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URL, { autoIndex: true });
    await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await mongoose.disconnect();
  });

  describe('1. No token: in-org routes return 401', () => {
    test('GET /api/project without token returns 401', async () => {
      const res = await request(app).get('/api/project').expect(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toMatch(/access token|No access token/i);
    });

    test('GET /api/notification without token returns 401', async () => {
      const res = await request(app).get('/api/notification').expect(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('2. Auth: login returns pre-org token + user + orgs', () => {
    test('POST /api/auth/login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.orgs).toBeDefined();
      expect(Array.isArray(res.body.data.orgs)).toBe(true);
      preOrgToken = res.body.data.access_token;
    });

    test('POST /api/auth/login with wrong password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPass1' })
        .expect(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('3. Auth: signup and refresh', () => {
    test('POST /api/auth/signup with valid body returns 201', async () => {
      const email = `signup-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          fullname: 'Signup Test',
          email,
          password: 'Test123',
        })
        .expect(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.orgs).toEqual([]);
    });

    test('POST /api/auth/refresh with cookie returns pre-org token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      const cookie = loginRes.headers['set-cookie'];
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookie)
        .expect(200);
      expect(res.body.data.access_token).toBeDefined();
    });
  });

  describe('4. Select-org: pre-org token + org_id returns org-scoped token', () => {
    test('POST /api/auth/select-org with pre-org token and org_id', async () => {
      const res = await request(app)
        .post('/api/auth/select-org')
        .set('Authorization', `Bearer ${preOrgToken}`)
        .send({ org_id: defaultOrgId.toString() })
        .expect(200);
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.org).toBeDefined();
      expect(res.body.data.role).toBeDefined();
      orgScopedToken = res.body.data.access_token;
    });

    test('Pre-org token must not work for in-org: GET /api/project returns 403', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${preOrgToken}`)
        .expect(403);
      expect(res.body.message).toMatch(/Organization context|select-org/i);
    });
  });

  describe('5. In-org: projects (org-scoped token)', () => {
    test('GET /api/project with org-scoped token returns 200', async () => {
      const res = await request(app)
        .get('/api/project')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('POST /api/project with org-scoped token creates project', async () => {
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
      expect(res.body.data.id).toBeDefined();
      createdProjectId = res.body.data.id;
    });
  });

  describe('6. In-org: collections (org-scoped token)', () => {
    let createdCollectionId;

    test('POST /api/collection creates collection', async () => {
      const name = `test-collection-${Date.now()}`;
      const res = await request(app)
        .post('/api/collection')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({ collection_name: name, description: 'Test' })
        .expect(201);
      expect(res.body.status).toBe('success');
      createdCollectionId = res.body.data?._id ?? res.body.data?.id;
      if (res.body.data && !createdCollectionId)
        createdCollectionId = res.body.data._id || res.body.data.id;
    });

    test('GET /api/collection/sort-projects with collection_id returns 200', async () => {
      if (!createdCollectionId) return;
      const res = await request(app)
        .get('/api/collection/sort-projects')
        .query({ collection_id: createdCollectionId })
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('7. In-org: notifications (org-scoped token)', () => {
    test('GET /api/notification returns 200', async () => {
      const res = await request(app)
        .get('/api/notification')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });

    test('GET /api/notification/count returns 200', async () => {
      const res = await request(app)
        .get('/api/notification/count')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('8. In-org: chat (org-scoped token)', () => {
    test('GET /api/chat/conversations returns 200', async () => {
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });

    test('GET /api/chat/online-users returns 200', async () => {
      const res = await request(app)
        .get('/api/chat/online-users')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('9. In-org: collaboration (org-scoped token)', () => {
    test('GET /api/collaboration/:project_id returns 200', async () => {
      if (!createdProjectId) return;
      const res = await request(app)
        .get(`/api/collaboration/${createdProjectId}`)
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });
  });

  describe('10. In-org: feedback (org-scoped token)', () => {
    test('POST /api/feedback/submit returns 201', async () => {
      const res = await request(app)
        .post('/api/feedback/submit')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .send({
          title: 'Test feedback title here',
          details: 'Detailed description with at least ten characters.',
          category: 'articles',
        })
        .expect(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.feedback).toBeDefined();
    });

    test('GET /api/feedback/user returns 200', async () => {
      const res = await request(app)
        .get('/api/feedback/user')
        .set('Authorization', `Bearer ${orgScopedToken}`)
        .expect(200);
      expect(res.body.status).toBe('success');
    });
  });
});
