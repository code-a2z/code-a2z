import { ObjectId } from 'mongodb';
import { DatabaseService } from '../database/database.service.js';
import { DocumentValidationError } from '../database/document-validation.js';
import {
  SET_PASSWORD_TOKEN_INDEXES,
  SetPasswordTokensRepository,
} from './set-password-tokens.repository.js';
import {
  SUBSCRIBER_INDEXES,
  SubscribersRepository,
} from './subscribers.repository.js';
import type { CreateUserInput } from './types/user.js';
import { USER_INDEXES, UsersRepository } from './users.repository.js';

describe('native user repositories', () => {
  const insertedId = new ObjectId();
  const insertOne = vi.fn().mockResolvedValue({ insertedId });
  const createIndexes = vi.fn().mockResolvedValue([]);
  const findOne = vi.fn().mockResolvedValue(null);
  const collection = vi.fn().mockReturnValue({
    createIndexes,
    findOne,
    insertOne,
  });
  const database = {
    getDb: () => ({ collection }),
  } as unknown as DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates all user-related indexes on their original collections', async () => {
    await new UsersRepository(database).onApplicationBootstrap();
    expect(collection).toHaveBeenLastCalledWith('users');
    expect(createIndexes).toHaveBeenLastCalledWith(USER_INDEXES);

    await new SubscribersRepository(database).onApplicationBootstrap();
    expect(collection).toHaveBeenLastCalledWith('subscribers');
    expect(createIndexes).toHaveBeenLastCalledWith(SUBSCRIBER_INDEXES);

    await new SetPasswordTokensRepository(database).onApplicationBootstrap();
    expect(collection).toHaveBeenLastCalledWith('set_password_tokens');
    expect(createIndexes).toHaveBeenLastCalledWith(SET_PASSWORD_TOKEN_INDEXES);

    expect(USER_INDEXES).toEqual([
      { key: { 'personal_info.subscriber_id': 1 }, unique: true },
      { key: { 'personal_info.username': 1 }, unique: true },
    ]);
    expect(SUBSCRIBER_INDEXES).toEqual([{ key: { email: 1 }, unique: true }]);
    expect(SET_PASSWORD_TOKEN_INDEXES).toEqual([
      { key: { token: 1 }, unique: true },
      { key: { org_id: 1 } },
      { key: { expires_at: 1 }, expireAfterSeconds: 0 },
    ]);
  });

  it('normalizes a user and applies the Express schema defaults before insert', async () => {
    const subscriberId = new ObjectId();
    const repository = new UsersRepository(database);

    const result = await repository.create({
      personal_info: {
        fullname: 'Test User',
        subscriber_id: subscriberId,
        password: 'hashed-password',
        username: 'TESTUSER',
      },
    });

    expect(insertOne).toHaveBeenCalledOnce();
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        personal_info: expect.objectContaining({
          subscriber_id: subscriberId,
          username: 'testuser',
          bio: '',
          profile_img: expect.stringContaining('https://api.dicebear.com/6.x/'),
        }),
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
        joinedAt: new Date('2026-01-02T03:04:05.000Z'),
        updatedAt: new Date('2026-01-02T03:04:05.000Z'),
      }),
    );
    expect(result._id).toBe(insertedId);
  });

  it('rejects invalid users without writing them', async () => {
    const repository = new UsersRepository(database);
    const invalidUser = {
      personal_info: {
        fullname: 'AB',
        subscriber_id: 'not-an-object-id',
        password: '123',
        username: 'xy',
      },
      role: 'superadmin',
    } as unknown as CreateUserInput;

    await expect(repository.create(invalidUser)).rejects.toBeInstanceOf(
      DocumentValidationError,
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it('preserves subscriber fields and defaults before insert', async () => {
    const repository = new SubscribersRepository(database);

    await repository.create({ email: 'TEST@example.com' });

    expect(insertOne).toHaveBeenCalledWith({
      email: 'TEST@example.com',
      is_subscribed: true,
      subscribed_at: new Date('2026-01-02T03:04:05.000Z'),
      unsubscribed_at: null,
      joinedAt: new Date('2026-01-02T03:04:05.000Z'),
      updatedAt: new Date('2026-01-02T03:04:05.000Z'),
    });

    await expect(repository.create({ email: '' })).rejects.toBeInstanceOf(
      DocumentValidationError,
    );
  });

  it('validates and normalizes set-password tokens before insert', async () => {
    const repository = new SetPasswordTokensRepository(database);
    const organizationId = new ObjectId();
    const expiresAt = new Date('2026-02-01T00:00:00.000Z');

    await repository.create({
      token: 'sample-token',
      email: ' TEST@EXAMPLE.COM ',
      org_id: organizationId,
      expires_at: expiresAt,
    });

    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'sample-token',
        email: 'test@example.com',
        org_id: organizationId,
        expires_at: expiresAt,
      }),
    );

    await expect(
      repository.create({
        token: '',
        email: 'test@example.com',
        org_id: organizationId,
        expires_at: expiresAt,
      }),
    ).rejects.toBeInstanceOf(DocumentValidationError);
  });
});
