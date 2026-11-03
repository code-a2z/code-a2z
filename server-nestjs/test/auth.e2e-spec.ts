import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { configureApplication } from '../src/app.configuration.js';
import { AppModule } from '../src/app.module.js';
import { DatabaseService } from '../src/database/database.service.js';
import { OrganizationMembersRepository } from '../src/organizations/organization-members.repository.js';
import { OrganizationsRepository } from '../src/organizations/organizations.repository.js';
import type { Organization } from '../src/organizations/types/organization.js';
import type { OrganizationMember } from '../src/organizations/types/organization-member.js';
import { SubscribersRepository } from '../src/users/subscribers.repository.js';
import type { Subscriber } from '../src/users/types/subscriber.js';
import type { User } from '../src/users/types/user.js';
import { UsersRepository } from '../src/users/users.repository.js';

describe('AuthController (e2e)', () => {
  const userId = new ObjectId();
  const subscriberId = new ObjectId();
  const organizationId = new ObjectId();
  let app: INestApplication<App>;
  let passwordHash: string;

  const users = {
    findBySubscriberId: vi.fn(),
    findById: vi.fn(),
    updatePassword: vi.fn(),
  };
  const subscribers = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };
  const organizationMembers = {
    findByUserId: vi.fn(),
    findByUserAndOrganization: vi.fn(),
  };
  const organizations = {
    findByIds: vi.fn(),
    findById: vi.fn(),
  };

  const subscriber = (): Subscriber & { _id: ObjectId } => ({
    _id: subscriberId,
    email: 'member@example.com',
    is_subscribed: true,
    subscribed_at: new Date(),
    unsubscribed_at: null,
    joinedAt: new Date(),
    updatedAt: new Date(),
  });

  const user = (): User & { _id: ObjectId } => ({
    _id: userId,
    personal_info: {
      fullname: 'Test Member',
      subscriber_id: subscriberId,
      password: passwordHash,
      username: 'testmember',
      bio: '',
      profile_img: 'https://example.com/avatar.svg',
    },
    social_links: {
      youtube: '',
      instagram: '',
      facebook: '',
      x: '',
      github: '',
      linkedin: '',
      website: '',
    },
    account_info: { total_posts: 0, total_reads: 0 },
    role: 'user',
    project_ids: [],
    collaborated_project_ids: [],
    collection_ids: [],
    joinedAt: new Date(),
    updatedAt: new Date(),
  });

  const membership = (
    role: OrganizationMember['role'] = 'member',
  ): OrganizationMember & { _id: ObjectId } => ({
    _id: new ObjectId(),
    user_id: userId,
    org_id: organizationId,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const organization = (
    status: Organization['status'] = 'active',
  ): Organization & { _id: ObjectId } => ({
    _id: organizationId,
    name: 'Test Organization',
    slug: 'test-organization',
    status,
    enabled_features: ['articles'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Valid123', 4);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    users.findBySubscriberId.mockResolvedValue(user());
    users.findById.mockResolvedValue(user());
    users.updatePassword.mockResolvedValue(true);
    subscribers.findByEmail.mockResolvedValue(subscriber());
    subscribers.findById.mockResolvedValue(subscriber());
    organizationMembers.findByUserId.mockResolvedValue([]);
    organizationMembers.findByUserAndOrganization.mockResolvedValue(
      membership(),
    );
    organizations.findByIds.mockResolvedValue([]);
    organizations.findById.mockResolvedValue(organization());

    const database = {
      getDb: () => ({
        collection: () => ({
          createIndexes: vi.fn().mockResolvedValue([]),
        }),
      }),
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(database)
      .overrideProvider(UsersRepository)
      .useValue(users)
      .overrideProvider(SubscribersRepository)
      .useValue(subscribers)
      .overrideProvider(OrganizationMembersRepository)
      .useValue(organizationMembers)
      .overrideProvider(OrganizationsRepository)
      .useValue(organizations)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs in, sets an HTTP-only refresh cookie, and allows zero organizations', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' })
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: userId.toHexString(),
          email: 'member@example.com',
        },
        orgs: [],
        access_token: expect.any(String),
      },
    });
    expect(response.headers['set-cookie']?.[0]).toContain('refresh_token=');
    expect(response.headers['set-cookie']?.[0]).toContain('HttpOnly');
    expect(JSON.stringify(response.body)).not.toContain(passwordHash);
    expect(JSON.stringify(response.body)).not.toContain('password');
  });

  it.each([
    ['wrong password', () => undefined, 'Wrong123'],
    [
      'missing subscriber',
      () => subscribers.findByEmail.mockResolvedValueOnce(null),
      'Valid123',
    ],
    [
      'missing user',
      () => users.findBySubscriberId.mockResolvedValueOnce(null),
      'Valid123',
    ],
  ])(
    'returns a generic credential error for %s',
    async (_case, arrange, password) => {
      arrange();

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'member@example.com', password })
        .expect(401);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid email or password',
      });
    },
  );

  it('refreshes a session cookie and rejects missing or wrong tokens', async () => {
    const agent = request.agent(app.getHttpServer());
    const login = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' })
      .expect(200);

    const refreshed = await agent.post('/api/v1/auth/refresh').expect(200);
    expect(refreshed.body.data.access_token).toEqual(expect.any(String));

    await request(app.getHttpServer()).post('/api/v1/auth/refresh').expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh_token=${login.body.data.access_token}`)
      .expect(401);
  });

  it('returns sessions with and without active organizations', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' });
    const accessToken = login.body.data.access_token as string;

    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.orgs).toEqual([]);
        expect(JSON.stringify(body)).not.toContain(passwordHash);
      });

    organizationMembers.findByUserId.mockResolvedValue([membership()]);
    organizations.findByIds.mockResolvedValue([organization()]);

    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.orgs).toEqual([
          {
            org_id: organizationId.toHexString(),
            name: 'Test Organization',
            role: 'member',
          },
        ]);
      });
  });

  it('selects an active membership and filters disabled feature permissions', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/select-org')
      .set('Authorization', `Bearer ${login.body.data.access_token}`)
      .send({ org_id: organizationId.toHexString() })
      .expect(200);

    expect(response.body.data).toMatchObject({
      access_token: expect.any(String),
      role: 'member',
      permissions: ['articles:read', 'articles:write', 'articles:delete'],
      org_features: ['articles'],
      org: { org_id: organizationId.toHexString() },
    });
    expect(response.body.data.permissions).not.toContain('chats:read');
    expect(response.body.data.permissions).not.toContain('admin_panel:access');

    await request(app.getHttpServer())
      .post('/api/v1/auth/select-org')
      .set('Authorization', `Bearer ${response.body.data.access_token}`)
      .send({ org_id: organizationId.toHexString() })
      .expect(403);
  });

  it('rejects invalid org ids, non-members, and client-supplied authorization', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' });
    const token = login.body.data.access_token as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/select-org')
      .set('Authorization', `Bearer ${token}`)
      .send({ org_id: 'invalid' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/select-org')
      .set('Authorization', `Bearer ${token}`)
      .send({
        org_id: organizationId.toHexString(),
        role: 'owner',
        permissions: ['admin_panel:access'],
      })
      .expect(400);

    organizationMembers.findByUserAndOrganization.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/api/v1/auth/select-org')
      .set('Authorization', `Bearer ${token}`)
      .send({ org_id: organizationId.toHexString() })
      .expect(403);
  });

  it('clears the refresh cookie and returns client cleanup hints', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .expect(200);

    expect(response.headers['set-cookie']?.[0]).toContain('refresh_token=;');
    expect(response.body.data.client_clear_hint).toEqual({
      clear_access_token: true,
      clear_selected_org_id: true,
    });
  });

  it('changes the authenticated user password and rejects a wrong current password', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' });
    const token = login.body.data.access_token as string;

    await request(app.getHttpServer())
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'Valid123',
        new_password: 'Changed123',
      })
      .expect(200);

    expect(users.updatePassword).toHaveBeenCalledWith(
      userId,
      expect.any(String),
    );

    await request(app.getHttpServer())
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'Wrong123',
        new_password: 'Changed123',
      })
      .expect(403);

    await request(app.getHttpServer())
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'Valid123',
        new_password: 'weak',
      })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        current_password: 'Valid123',
        new_password: 'Changed123',
        user_id: new ObjectId().toHexString(),
      })
      .expect(400);
  });

  it('rejects invalid access tokens', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('supports the frontend-compatible /api/auth alias', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'member@example.com', password: 'Valid123' })
      .expect(200);
  });
});
